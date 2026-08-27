import cv2
import numpy as np
import mediapipe as mp

from config import IMAGE_SIZE

mp_hands = mp.solutions.hands

def create_hands(static_image_mode=True):
    return mp_hands.Hands(
        static_image_mode=static_image_mode,
        max_num_hands=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

def extract_palm(image, hands):
    if image is None or image.size == 0:
        return None

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)
    if not result.multi_hand_landmarks:
        return None

    landmarks = result.multi_hand_landmarks[0].landmark
    h, w = image.shape[:2]
    xs = [int(np.clip(p.x, 0, 1) * w) for p in landmarks]
    ys = [int(np.clip(p.y, 0, 1) * h) for p in landmarks]

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    margin = int(max(max_x - min_x, max_y - min_y) * 0.25)

    x1 = max(min_x - margin, 0)
    y1 = max(min_y - margin, 0)
    x2 = min(max_x + margin, w)
    y2 = min(max_y + margin, h)

    crop = image[y1:y2, x1:x2]
    if crop.size == 0:
        return None

    return cv2.resize(crop, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_AREA)

def cosine_similarity(a, b):
    a = np.asarray(a, dtype=np.float32)
    b = np.asarray(b, dtype=np.float32)
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))
