import os

IMAGE_SIZE = 224
CAMERA_INDEX = 0
CAPTURE_IMAGES_PER_SESSION = 50
CAPTURE_DELAY_SECONDS = 0.7

# Calibrated biometric decision threshold for MobileNetV2 cosine embeddings
MATCH_THRESHOLD = 0.55

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
EMBEDDING_DB = os.path.join(BASE_DIR, "embeddings", "database.pkl")
