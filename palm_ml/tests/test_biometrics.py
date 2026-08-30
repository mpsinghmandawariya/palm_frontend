import pytest
from fastapi.testclient import TestClient
import numpy as np
import cv2
import json

from app import app
from config import MATCH_THRESHOLD_VERIFY, MATCH_THRESHOLD_IDENTIFY

client = TestClient(app)

def create_dummy_image_bytes():
    """Generates a synthetic 224x224 RGB image buffer"""
    img = np.zeros((224, 224, 3), dtype=np.uint8)
    # Draw simple palm shape
    cv2.circle(img, (112, 112), 60, (200, 180, 160), -1)
    _, encoded = cv2.imencode(".jpg", img)
    return encoded.tobytes()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert "uptime_seconds" in data

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
    image_bytes = create_dummy_image_bytes()
    response = client.post(
        "/verify",
        files={"file": ("palm.jpg", image_bytes, "image/jpeg")},
        data={"target_embedding": "not-a-json-array"}
    )
    assert response.status_code == 400

def test_identify_empty_candidates():
    image_bytes = create_dummy_image_bytes()
    response = client.post(
        "/identify",
        files={"file": ("palm.jpg", image_bytes, "image/jpeg")},
        data={"candidates": "[]"}
    )
    assert response.status_code == 400
