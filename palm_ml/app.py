from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import json
import time

from config import IMAGE_SIZE, MATCH_THRESHOLD_VERIFY, MATCH_THRESHOLD_IDENTIFY, MIN_REGISTRATION_QUALITY
from palm_utils import create_hands, extract_palm, cosine_similarity, assess_quality, detect_liveness
from embedding import get_embedding

START_TIME = time.time()

# Pre-load MediaPipe and MobileNetV2 at startup (Module level, not per request)
print("Initializing Biometric ML Pipeline (MediaPipe + MobileNetV2)...")
HANDS_DETECTOR = create_hands(static_image_mode=True, max_num_hands=2)
# Warm up MobileNetV2 embedding extractor
dummy_img = np.zeros((IMAGE_SIZE, IMAGE_SIZE, 3), dtype=np.uint8)
_ = get_embedding(dummy_img)
print("ML Models loaded and ready.")

app = FastAPI(
    title="Palm Pay ML Biometric Engine",
    version="2.2.0",
    description="Enterprise Palm Identification & Verification Service (MediaPipe + MobileNetV2)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    print("Unhandled ML service error:", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal ML Error: {str(exc)}"}
    )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": True,
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "verify_threshold": MATCH_THRESHOLD_VERIFY,
        "identify_threshold": MATCH_THRESHOLD_IDENTIFY
    }


def process_image_file(contents: bytes):
    image_array = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        return None
    return image


@app.post("/register")
async def register(file: UploadFile = File(...)):
    """
    1:1 Enrollment Pipeline:
    Extracts 1280-d MobileNetV2 embedding from single-frame camera capture.
    Raw image is never written to disk or database.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image content type")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty image file received")

    image = process_image_file(contents)
    if image is None:
        raise HTTPException(status_code=400, detail="Corrupted or unreadable image file")

    palm, num_hands = extract_palm(image, HANDS_DETECTOR)

    if num_hands == 0:
        raise HTTPException(status_code=422, detail="No hand detected in the frame. Place your open palm clearly inside the guide.")

    if num_hands > 1:
        raise HTTPException(status_code=422, detail="Multiple hands detected. Please place only one hand in the frame.")

    quality_score = assess_quality(palm)
    liveness_score = detect_liveness(palm)

    if quality_score < MIN_REGISTRATION_QUALITY:
        raise HTTPException(
            status_code=422,
            detail=f"Image quality score ({quality_score:.2f}) is below minimum threshold ({MIN_REGISTRATION_QUALITY:.2f}). Improve lighting and hold hand steady."
        )

    embedding = get_embedding(palm)
    if embedding is None or len(embedding) != 1280:
        raise HTTPException(status_code=500, detail="Failed to extract 1280-d biometric feature vector")

    return {
        "success": True,
        "embedding": embedding.tolist(),
        "quality_score": quality_score,
        "liveness_score": liveness_score,
    }


@app.post("/verify")
async def verify(
    file: UploadFile = File(...),
    target_embedding: str = Form(...)
):
    """
    1:1 Verification Pipeline:
    Compares live palm scan against a single user's stored 1280-d embedding.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image content type")

    try:
        stored_vector = json.loads(target_embedding)
        if not isinstance(stored_vector, list) or len(stored_vector) != 1280:
            raise ValueError("Target embedding must be a 1280-dimensional float array")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid target embedding format: {str(e)}")

    contents = await file.read()
    image = process_image_file(contents)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid or unreadable image file")

    palm, num_hands = extract_palm(image, HANDS_DETECTOR)

    if num_hands == 0:
        raise HTTPException(status_code=422, detail="No palm detected in frame. Hold your open hand over the camera.")

    if num_hands > 1:
        raise HTTPException(status_code=422, detail="Multiple hands detected in frame.")

    quality_score = assess_quality(palm)
    liveness_score = detect_liveness(palm)

    live_embedding = get_embedding(palm)
    if live_embedding is None:
        raise HTTPException(status_code=500, detail="Failed to compute live palm embedding")

    score = cosine_similarity(live_embedding, stored_vector)
    is_verified = bool(score >= MATCH_THRESHOLD_VERIFY)

    return {
        "verified": is_verified,
        "score": round(float(score), 4),
        "quality_score": quality_score,
        "liveness_score": liveness_score,
        "threshold": MATCH_THRESHOLD_VERIFY
    }


@app.post("/identify")
async def identify(
    file: UploadFile = File(...),
    candidates: str = Form(...),
    threshold: float = Form(MATCH_THRESHOLD_IDENTIFY)
):
    """
    1:N Identification Pipeline:
    Compares live scan against candidate stored embeddings to find best match.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image content type")

    try:
        candidate_list = json.loads(candidates)
        if not isinstance(candidate_list, list) or len(candidate_list) == 0:
            raise ValueError("Candidates list cannot be empty")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid candidates format: {str(e)}")

    contents = await file.read()
    image = process_image_file(contents)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    palm, num_hands = extract_palm(image, HANDS_DETECTOR)

    if num_hands == 0:
        raise HTTPException(status_code=422, detail="No palm detected in frame. Hold hand steady over scanner.")

    if num_hands > 1:
        raise HTTPException(status_code=422, detail="Multiple hands detected. Scanner requires exactly one palm.")

    live_embedding = get_embedding(palm)
    if live_embedding is None:
        raise HTTPException(status_code=500, detail="Failed to extract palm features")

    # 1:N Linear Search (Cosine similarity across candidate embeddings)
    best_match_id = None
    best_score = -1.0

    for cand in candidate_list:
        cand_id = cand.get("id") or cand.get("userId")
        cand_vec = cand.get("embedding")
        if not cand_id or not cand_vec:
            continue

        score = cosine_similarity(live_embedding, cand_vec)
        if score > best_score:
            best_score = score
            best_match_id = cand_id

    if best_match_id is not None and best_score >= threshold:
        return {
            "match": {
                "id": str(best_match_id),
                "score": round(float(best_score), 4)
            }
        }
    else:
        return {
            "match": None,
            "best_score": round(float(max(best_score, 0.0)), 4),
            "threshold": threshold
        }