import pytest
from fastapi.testclient import TestClient
import numpy as np
import cv2

from app import app
from config import (
    IMAGE_SIZE,
    EMBEDDING_DIM,
    MATCH_THRESHOLD_VERIFY,
    MATCH_THRESHOLD_IDENTIFY,
    MIN_REGISTRATION_QUALITY,
    MIN_LIVENESS_SCORE,
)
from embedding import get_embedding
from palm_utils import cosine_similarity, assess_quality, detect_liveness

client = TestClient(app)


def create_synthetic_palm_bytes(pattern_type="horizontal", skin_color=(190, 170, 150)):
    """
    Generates synthetic 224x224 RGB palm image with distinct principal creases.
    """
    img = np.full((IMAGE_SIZE, IMAGE_SIZE, 3), skin_color, dtype=np.uint8)

    # Draw palm boundary & contour
    cv2.ellipse(img, (112, 112), (75, 90), 0, 0, 360, (skin_color[0] - 15, skin_color[1] - 15, skin_color[2] - 15), -1)

    if pattern_type == "horizontal":
        # User A: Strong horizontal heart and head creases
        for y in [65, 90, 115, 140, 165]:
            cv2.line(img, (45, y), (175, y), (35, 25, 20), 3)
    elif pattern_type == "diagonal":
        # User B: Steep diagonal life and fate creases
        for offset in [-60, -30, 0, 30, 60]:
            cv2.line(img, (45 + offset, 45), (175 + offset, 175), (35, 25, 20), 3)
    elif pattern_type == "vertical":
        # User C: Vertical line creases
        for x in [65, 90, 115, 140, 165]:
            cv2.line(img, (x, 45), (x, 175), (35, 25, 20), 3)

    _, encoded = cv2.imencode(".jpg", img)
    return encoded.tobytes(), img


# ============================================================
# 1. Health & Config Tests
# ============================================================

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert data["embedding_dim"] == EMBEDDING_DIM
    assert "uptime_seconds" in data
    assert data["verify_threshold"] == MATCH_THRESHOLD_VERIFY
    assert data["identify_threshold"] == MATCH_THRESHOLD_IDENTIFY


# ============================================================
# 2. Input Validation Tests
# ============================================================

def test_register_invalid_file_type():
    response = client.post(
        "/register",
        files={"file": ("test.txt", b"not an image", "text/plain")}
    )
    assert response.status_code == 400


def test_register_empty_file():
    response = client.post(
        "/register",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert response.status_code == 400


def test_verify_malformed_target_embedding():
    image_bytes, _ = create_synthetic_palm_bytes("horizontal")
    response = client.post(
        "/verify",
        files={"file": ("palm.jpg", image_bytes, "image/jpeg")},
        data={"target_embedding": "not-a-json-array"}
    )
    assert response.status_code == 400


def test_identify_empty_candidates():
    image_bytes, _ = create_synthetic_palm_bytes("horizontal")
    response = client.post(
        "/identify",
        files={"file": ("palm.jpg", image_bytes, "image/jpeg")},
        data={"candidates": "[]"}
    )
    assert response.status_code == 400


# ============================================================
# 3. Biometric Discriminability & Consistency (Fix 1 Verification)
# ============================================================

def test_embedding_dimension_is_1280():
    _, img_a = create_synthetic_palm_bytes("horizontal")
    emb = get_embedding(img_a)
    assert len(emb) == EMBEDDING_DIM
    assert np.isclose(np.linalg.norm(emb), 1.0, atol=1e-4)


def test_embedding_discriminability_same_vs_different_palms():
    """
    CRITICAL BIOMETRIC TEST:
    Asserts that the feature extractor generates near-identical embeddings for the same palm,
    and distinct, non-matching embeddings for palms with different line patterns.
    """
    _, img_a1 = create_synthetic_palm_bytes("horizontal", skin_color=(190, 170, 150))
    _, img_a2 = create_synthetic_palm_bytes("horizontal", skin_color=(185, 165, 145))
    _, img_b = create_synthetic_palm_bytes("diagonal", skin_color=(190, 170, 150))
    _, img_c = create_synthetic_palm_bytes("vertical", skin_color=(190, 170, 150))

    emb_a1 = get_embedding(img_a1)
    emb_a2 = get_embedding(img_a2)
    emb_b = get_embedding(img_b)
    emb_c = get_embedding(img_c)

    same_score = cosine_similarity(emb_a1, emb_a2)
    diff_score_ab = cosine_similarity(emb_a1, emb_b)
    diff_score_ac = cosine_similarity(emb_a1, emb_c)

    print(f"\n[TEST RESULT] Same Palm Score: {same_score:.4f}")
    print(f"[TEST RESULT] Diff Palm (A vs B): {diff_score_ab:.4f}")
    print(f"[TEST RESULT] Diff Palm (A vs C): {diff_score_ac:.4f}")

    # Same palm must produce very high similarity (>= 0.95)
    assert same_score >= 0.95, f"Same palm consistency failed: {same_score:.4f}"

    # Different palms must produce significantly lower similarity (below 1:1 verify threshold 0.65 or lower)
    assert diff_score_ab < MATCH_THRESHOLD_VERIFY, f"Impostor palm scored above threshold: {diff_score_ab:.4f}"
    assert diff_score_ac < MATCH_THRESHOLD_VERIFY, f"Impostor palm scored above threshold: {diff_score_ac:.4f}"


# ============================================================
# 4. Quality Floor & Anti-Spoofing Rejection Tests (Fix 6 / Fix 9)
# ============================================================

def test_quality_assessment_score():
    # Completely black / blank image
    blank = np.zeros((IMAGE_SIZE, IMAGE_SIZE, 3), dtype=np.uint8)
    quality = assess_quality(blank)
    assert quality < MIN_REGISTRATION_QUALITY


def test_anti_spoofing_liveness_score():
    # Flat color printout
    flat_photo = np.full((IMAGE_SIZE, IMAGE_SIZE, 3), 128, dtype=np.uint8)
    liveness = detect_liveness(flat_photo)
    assert liveness < MIN_LIVENESS_SCORE


# ============================================================
# 5. End-to-End Verification & Identification Pipelines
# ============================================================

def test_1_to_1_verification_logic():
    _, img_user = create_synthetic_palm_bytes("horizontal")
    _, img_impostor = create_synthetic_palm_bytes("diagonal")

    user_template = get_embedding(img_user).tolist()
    live_scan = get_embedding(img_user)
    impostor_scan = get_embedding(img_impostor)

    # Genuine match
    genuine_sim = cosine_similarity(live_scan, user_template)
    assert genuine_sim >= MATCH_THRESHOLD_VERIFY

    # Impostor discrimination
    impostor_sim = cosine_similarity(impostor_scan, user_template)
    assert impostor_sim < MATCH_THRESHOLD_VERIFY


def test_1_to_N_identification_logic():
    _, img_1 = create_synthetic_palm_bytes("horizontal")
    _, img_2 = create_synthetic_palm_bytes("diagonal")
    _, img_3 = create_synthetic_palm_bytes("vertical")

    vec_1 = get_embedding(img_1).tolist()
    vec_2 = get_embedding(img_2).tolist()
    vec_3 = get_embedding(img_3).tolist()

    candidates = [
        {"id": "user_1", "embedding": vec_1},
        {"id": "user_2", "embedding": vec_2},
        {"id": "user_3", "embedding": vec_3},
    ]

    # Test candidate 2 query
    query_vec = get_embedding(img_2)
    scores = [(c["id"], cosine_similarity(query_vec, c["embedding"])) for c in candidates]
    best_id, best_score = max(scores, key=lambda x: x[1])

    assert best_id == "user_2"
    assert best_score >= 0.95
