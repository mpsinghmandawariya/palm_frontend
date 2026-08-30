import os

IMAGE_SIZE = 224
CAMERA_INDEX = 0

# Keep in sync with backend/.env
MATCH_THRESHOLD_VERIFY = 0.65       # 1:1 Verification threshold
MATCH_THRESHOLD_IDENTIFY = 0.78     # 1:N Identification threshold (stricter for open-set search)
MIN_REGISTRATION_QUALITY = 0.35     # Minimum sharpness/exposure floor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
