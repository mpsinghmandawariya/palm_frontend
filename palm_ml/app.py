from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import json
import time

from config import IMAGE_SIZE, MATCH_THRESHOLD
from palm_utils import create_hands, extract_palm, cosine_similarity, assess_quality, detect_liveness
from embedding import get_embedding

app = FastAPI(
    title="Palm Pay ML Service",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "service": "Palm Pay ML Engine v2.0",
        "capabilities": ["palm_detection", "mobilenet_v2_embedding", "quality_assessment", "liveness_pad"]
    }


def process_image_file(contents: bytes):
    image_array = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        return None
    return image


@app.post("/register")
async def register(file: UploadFile = File(...)):
    start_time = time.time()
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file")

    try:
        contents = await file.read()
        image = process_image_file(contents)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        hands = create_hands(static_image_mode=True)
        try:
            palm = extract_palm(image, hands)
        finally:
            hands.close()

        if palm is None:
            return {
                "success": False,
                "message": "No palm detected in the image. Position your hand clearly inside the frame.",
                "quality_score": 0.0,
                "liveness_score": 0.0,
                "embedding": None
            }

        quality_score = assess_quality(palm)
        liveness_score = detect_liveness(palm)

        if quality_score < 0.35:
            return {
                "success": False,
                "message": "Image quality too low or blurry. Improve lighting and hold hand steady.",
                "quality_score": quality_score,
                "liveness_score": liveness_score,
                "embedding": None
            }

        embedding = get_embedding(palm)
        processing_time = round((time.time() - start_time) * 1000, 2)

        return {
            "success": True,
            "message": "Palm successfully registered",
            "quality_score": quality_score,
            "liveness_score": liveness_score,
            "processing_time_ms": processing_time,
            "embedding": embedding.tolist()
        }

    except HTTPException:
        raise
    except Exception as error:
        print("Registration error:", error)
        raise HTTPException(status_code=500, detail=f"Palm registration failed: {str(error)}")


@app.post("/verify")
async def verify(
    file: UploadFile = File(...),
    target_embedding: str = Form(...)
):
    start_time = time.time()
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image")

    try:
        try:
            stored_vector = json.loads(target_embedding)
            if not isinstance(stored_vector, list) or len(stored_vector) == 0:
                raise ValueError("Target embedding must be a non-empty list")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid target embedding format: {str(e)}")

        contents = await file.read()
        image = process_image_file(contents)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        hands = create_hands(static_image_mode=True)
        try:
            palm = extract_palm(image, hands)
        finally:
            hands.close()

        processing_time = round((time.time() - start_time) * 1000, 2)

        if palm is None:
            return {
                "success": False,
                "verified": False,
                "similarity": 0.0,
                "threshold": MATCH_THRESHOLD,
                "quality_score": 0.0,
                "liveness_score": 0.0,
                "processing_time_ms": processing_time,
                "message": "No palm detected in frame. Hold your hand steady."
            }

        quality_score = assess_quality(palm)
        liveness_score = detect_liveness(palm)

        live_embedding = get_embedding(palm)
        if live_embedding is None:
            return {
                "success": False,
                "verified": False,
                "similarity": 0.0,
                "threshold": MATCH_THRESHOLD,
                "quality_score": quality_score,
                "liveness_score": liveness_score,
                "processing_time_ms": processing_time,
                "message": "Failed to compute palm embedding"
            }

        score = cosine_similarity(live_embedding, stored_vector)
        is_verified = bool(score >= MATCH_THRESHOLD)
        processing_time = round((time.time() - start_time) * 1000, 2)

        return {
            "success": True,
            "verified": is_verified,
            "similarity": round(float(score), 4),
            "threshold": MATCH_THRESHOLD,
            "quality_score": quality_score,
            "liveness_score": liveness_score,
            "processing_time_ms": processing_time,
            "message": "Palm verified successfully" if is_verified else f"Palm match failed (similarity {score:.2f} < {MATCH_THRESHOLD:.2f})"
        }

    except HTTPException:
        raise
    except Exception as error:
        print("Verification error:", error)
        raise HTTPException(status_code=500, detail=f"Palm verification failed: {str(error)}")