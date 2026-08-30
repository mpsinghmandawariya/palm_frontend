import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Biometric Embedding Dimensions
EMBEDDING_DIM = 1280
IMAGE_SIZE = 224
CAMERA_INDEX = 0

# Biometric Match Thresholds (keep in sync with backend/.env)
MATCH_THRESHOLD_VERIFY = 0.65       # 1:1 Verification threshold
MATCH_THRESHOLD_IDENTIFY = 0.78     # 1:N Identification threshold (stricter for open-set search)
MATCH_THRESHOLD = MATCH_THRESHOLD_IDENTIFY  # Alias for recognize.py (1:N offline recognition demo)

# Quality & Liveness Gates
MIN_REGISTRATION_QUALITY = 0.35     # Minimum sharpness/exposure floor
MIN_LIVENESS_SCORE = 0.45           # Minimum anti-spoofing liveness floor to prevent photo presentation attacks

# Offline Dataset & Tooling Paths
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
EMBEDDING_DB = os.path.join(BASE_DIR, "embeddings", "embeddings.pkl")
CAPTURE_DELAY_SECONDS = 1.5
CAPTURE_IMAGES_PER_SESSION = 20
