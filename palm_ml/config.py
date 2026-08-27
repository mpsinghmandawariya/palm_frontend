import os

IMAGE_SIZE = 224
CAMERA_INDEX = 0
CAPTURE_IMAGES_PER_SESSION = 50
CAPTURE_DELAY_SECONDS = 0.7
# Demo starting point only. Calibrate this threshold using validation data.
MATCH_THRESHOLD = 0.70
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
EMBEDDING_DB = os.path.join(BASE_DIR, "embeddings", "database.pkl")
