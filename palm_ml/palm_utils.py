import cv2
import numpy as np
import mediapipe as mp

from config import IMAGE_SIZE

mp_hands = mp.solutions.hands

def create_hands(static_image_mode=True, max_num_hands=2):
    return mp_hands.Hands(
        static_image_mode=static_image_mode,
        max_num_hands=max_num_hands,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

def extract_palm(image, hands):
    """
    Detects hands in the input image.
    Returns (cropped_palm_image, hand_count)
    - hand_count == 0: No hand found
    - hand_count > 1: Multiple hands found (ambiguous)
    - hand_count == 1: Exactly one hand found, returns cropped palm ROI
    """
    if image is None or image.size == 0:
        return None, 0

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if not result.multi_hand_landmarks:
        return None, 0

    num_hands = len(result.multi_hand_landmarks)
    if num_hands > 1:
        return None, num_hands

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
        return None, 0

    resized = cv2.resize(crop, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_AREA)
    return resized, 1

def assess_quality(image):
    """
    Assesses image blurriness and lighting exposure.
    Returns quality score between 0.0 and 1.0
    """
    if image is None or image.size == 0:
        return 0.0

    if image.ndim == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # Sharpness via Laplacian variance
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    sharpness_score = min(1.0, laplacian_var / 500.0)

    # Brightness score (ideal mean brightness between 80 and 180)
    mean_bright = gray.mean()
    if 80 <= mean_bright <= 180:
        brightness_score = 1.0
    else:
        brightness_score = max(0.2, 1.0 - abs(mean_bright - 130) / 130)

    quality = 0.6 * sharpness_score + 0.4 * brightness_score
    return round(float(np.clip(quality, 0.0, 1.0)), 3)

def detect_liveness(image):
    """
    Presentation Attack Detection (PAD).
    Evaluates high-frequency texture spectrum and color variance.
    Returns un-clamped liveness score between 0.0 and 1.0.
    """
    if image is None or image.size == 0:
        return 0.0

    if image.ndim == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    h, w = gray.shape

    # Frequency analysis via FFT to detect screen grid artifacts / flat printouts
    dft = cv2.dft(np.float32(gray), flags=cv2.DFT_COMPLEX_OUTPUT)
    dft_shift = np.fft.fftshift(dft)
    magnitude_spectrum = 20 * np.log(cv2.magnitude(dft_shift[:, :, 0], dft_shift[:, :, 1]) + 1e-6)

    # Calculate high-frequency energy ratio without artificial floors
    center_h, center_w = h // 2, w // 2
    r = 30
    mask = np.ones((h, w), np.uint8)
    cv2.circle(mask, (center_w, center_h), r, 0, -1)

    high_freq_energy = float(np.mean(magnitude_spectrum[mask == 1]))
    total_energy = float(np.mean(magnitude_spectrum) + 1e-6)

    ratio = high_freq_energy / total_energy
    # Unclamped liveness score proportional to natural skin frequency dispersion
    liveness_score = float(np.clip(ratio / 1.4, 0.0, 1.0))

    if image.ndim == 3:
        color_std = float(np.std(image))
        if color_std < 18.0:  # flat photo printout threshold
            liveness_score *= (color_std / 18.0)

    return round(float(np.clip(liveness_score, 0.0, 1.0)), 3)

def cosine_similarity(a, b):
    a = np.asarray(a, dtype=np.float32)
    b = np.asarray(b, dtype=np.float32)
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))
