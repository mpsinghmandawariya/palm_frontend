import os
import numpy as np
import cv2

from config import IMAGE_SIZE, EMBEDDING_DIM, BASE_DIR

_CLAHE = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
_FINE_TUNED_MODEL = None
CHECKPOINT_PATH = os.path.join(BASE_DIR, "models", "palm_embedding_fine_tuned.keras")

# Dimension Partition: 640 (Multi-Scale LBP) + 384 (Directional Crease HOG) + 256 (Gabor Wavelet Filters) = 1280
LBP_DIM = 640
HOG_DIM = 384
GABOR_DIM = 256
assert LBP_DIM + HOG_DIM + GABOR_DIM == EMBEDDING_DIM, f"Features must sum to {EMBEDDING_DIM}"


def get_fine_tuned_model():
    """
    Loads fine-tuned metric learning checkpoint if present on disk.
    """
    global _FINE_TUNED_MODEL
    if _FINE_TUNED_MODEL is None and os.path.isfile(CHECKPOINT_PATH):
        try:
            import tensorflow as tf
            _FINE_TUNED_MODEL = tf.keras.models.load_model(CHECKPOINT_PATH, compile=False)
            print(f"[INFO] Loaded fine-tuned palm embedding model from {CHECKPOINT_PATH}")
        except Exception as e:
            print(f"[WARN] Could not load fine-tuned model ({e}). Using hybrid descriptor.")
    return _FINE_TUNED_MODEL


def preprocess_palm_roi(image):
    """
    Converts palm image to grayscale and applies CLAHE contrast enhancement
    to normalize lighting and skin tone while highlighting dermal ridges and creases.
    """
    if image is None or image.size == 0:
        raise ValueError("Empty image supplied.")

    if image.shape[0] != IMAGE_SIZE or image.shape[1] != IMAGE_SIZE:
        image = cv2.resize(image, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_AREA)

    if image.ndim == 2:
        gray = image
    elif image.shape[-1] == 4:
        gray = cv2.cvtColor(image[:, :, :3], cv2.COLOR_BGR2GRAY)
    elif image.shape[-1] == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        raise ValueError("Unsupported image channel format.")

    enhanced_gray = _CLAHE.apply(gray)
    return enhanced_gray


def extract_lbp_descriptor(gray_image):
    """
    Computes Multi-Scale Spatial Local Binary Patterns (LBP) across a 4x4 spatial grid.
    Captures micro-texture and palm crease topology (640 dimensions).
    """
    h, w = gray_image.shape
    lbp = np.zeros((h - 2, w - 2), dtype=np.uint8)
    center = gray_image[1:-1, 1:-1]

    neighbors = [(-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1)]
    for idx, (dy, dx) in enumerate(neighbors):
        shifted = gray_image[1 + dy:h - 1 + dy, 1 + dx:w - 1 + dx]
        lbp = lbp | ((shifted >= center).astype(np.uint8) << (7 - idx))

    # 4x4 spatial grid cells, 40 bins each -> 16 * 40 = 640 features
    gh, gw = lbp.shape[0] // 4, lbp.shape[1] // 4
    histograms = []
    for r in range(4):
        for c in range(4):
            cell = lbp[r * gh:(r + 1) * gh, c * gw:(c + 1) * gw]
            hist, _ = np.histogram(cell, bins=40, range=(0, 256))
            h_f = hist.astype(np.float32)
            h_f = h_f - np.mean(h_f)
            norm = np.linalg.norm(h_f)
            if norm > 0:
                h_f /= norm
            histograms.append(h_f)
    return np.concatenate(histograms)  # 640-d


def extract_hog_descriptor(gray_image):
    """
    Computes Directional Crease Gradient Histograms (HOG) across 4x4 grid cells (384 dimensions).
    """
    gx = cv2.Sobel(gray_image, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray_image, cv2.CV_32F, 0, 1, ksize=3)
    mag, ang = cv2.cartToPolar(gx, gy, angleInDegrees=True)

    gh, gw = gray_image.shape[0] // 4, gray_image.shape[1] // 4
    histograms = []
    for r in range(4):
        for c in range(4):
            cell_mag = mag[r * gh:(r + 1) * gh, c * gw:(c + 1) * gw]
            cell_ang = ang[r * gh:(r + 1) * gh, c * gw:(c + 1) * gw]
            hist, _ = np.histogram(cell_ang, bins=24, range=(0, 360), weights=cell_mag)
            h_f = hist.astype(np.float32)
            h_f = h_f - np.mean(h_f)
            norm = np.linalg.norm(h_f)
            if norm > 0:
                h_f /= norm
            histograms.append(h_f)
    return np.concatenate(histograms)[:HOG_DIM]  # 384-d


def extract_gabor_descriptor(gray_image):
    """
    Applies Multi-Orientation 2D Gabor Wavelet Filters across 8 principal angles (256 dimensions).
    Captures principal life, heart, and head line angles.
    """
    angles = [0, np.pi / 8, np.pi / 4, 3 * np.pi / 8, np.pi / 2, 5 * np.pi / 8, 3 * np.pi / 4, 7 * np.pi / 8]
    gabor_stats = []

    for theta in angles:
        kernel = cv2.getGaborKernel((15, 15), 2.5, theta, 10.0, 0.5, 0, ktype=cv2.CV_32F)
        filt = np.abs(cv2.filter2D(gray_image, cv2.CV_32F, kernel))

        # 4x4 spatial cells
        gh, gw = filt.shape[0] // 4, filt.shape[1] // 4
        for r in range(4):
            for c in range(4):
                cell = filt[r * gh:(r + 1) * gh, c * gw:(c + 1) * gw]
                gabor_stats.append(float(np.mean(cell)))
                gabor_stats.append(float(np.std(cell)))

    gabor_vec = np.array(gabor_stats[:GABOR_DIM], dtype=np.float32)
    gabor_vec = gabor_vec - np.mean(gabor_vec)
    norm = np.linalg.norm(gabor_vec)
    if norm > 0:
        gabor_vec /= norm
    return gabor_vec  # 256-d


def get_embedding(image):
    """
    Extracts a 1280-dimensional discriminative biometric embedding:
    - If fine-tuned checkpoint exists: runs inference through trained metric network.
    - Otherwise (Option A): computes high-discriminability hybrid palm descriptor:
      1. Grayscale + CLAHE illumination normalization
      2. Spatial LBP micro-texture descriptor: 640-d
      3. Directional crease gradient histograms: 384-d
      4. Multi-orientation Gabor principal line filters: 256-d
      5. Mean-centered L2 Unit Sphere Normalization.
    """
    fine_tuned = get_fine_tuned_model()
    if fine_tuned is not None:
        if image.shape[0] != IMAGE_SIZE or image.shape[1] != IMAGE_SIZE:
            image = cv2.resize(image, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_AREA)
        if image.ndim == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        elif image.shape[-1] == 4:
            image = cv2.cvtColor(image[:, :, :3], cv2.COLOR_BGR2RGB)
        batch = np.expand_dims(image.astype(np.float32) / 255.0, axis=0)
        vec = fine_tuned.predict(batch, verbose=0)[0].astype(np.float32)
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec

    enhanced_gray = preprocess_palm_roi(image)

    lbp_feat = extract_lbp_descriptor(enhanced_gray)
    hog_feat = extract_hog_descriptor(enhanced_gray)
    gabor_feat = extract_gabor_descriptor(enhanced_gray)

    combined = np.concatenate([lbp_feat, hog_feat, gabor_feat]).astype(np.float32)
    combined = combined - np.mean(combined)
    norm = np.linalg.norm(combined)
    if norm == 0:
        raise ValueError("Generated embedding has zero norm.")

    return combined / norm
