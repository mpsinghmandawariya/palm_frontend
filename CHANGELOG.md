# Palm Pay — Changelog & Biometric Upgrade Notes

All notable technical fixes and improvements are documented below.

---

## [v2.3.0] — Biometric Model Discriminability, Security & Offline Tooling Overhaul

### 1. Root Cause Fix: Discriminative Palmprint Embeddings (Fix 1)
- **File:** `palm_ml/embedding.py`
- **Issue:** Generic ImageNet-pretrained MobileNetV2 with `pooling="avg"` collapsed 2D spatial feature maps into a non-discriminating average vector dominated by skin tone/lighting, producing near-identical similarity (>0.85–0.98) across all users.
- **Resolution:**
  - Integrated **Grayscale + CLAHE** contrast enhancement to normalize illumination and skin tone while highlighting dermal ridges and crease lines.
  - Replaced global average pooling with a hybrid spatial texture descriptor:
    1. **Multi-Scale Spatial Uniform LBP (640-d)**: Encodes local ridge orientation and topology across 4x4 spatial grid cells.
    2. **Multi-Orientation Gabor Wavelet Filters (400-d)**: Captures principal life, heart, and head line angles.
    3. **Directional Crease Gradient Histograms (240-d)**: Captures directional gradient distributions.
  - Normalizes final vector to exact **1280 dimensions** (`EMBEDDING_DIM = 1280`) on the $L_2$ unit sphere.
  - Added metric-learning fine-tuning scaffolding script: [`palm_ml/train_embedding_model.py`](file:///c:/Users/Mahipal%20singh%20deora/OneDrive/Desktop/setup/palm_ml/train_embedding_model.py).

---

### 2. Fixed Missing Constants & ImportErrors (Fix 2)
- **File:** `palm_ml/config.py`
- **Issue:** Offline tools (`capture.py`, `register.py`, `recognize.py`) threw `ImportError` on missing constants.
- **Resolution:** Defined `EMBEDDING_DIM = 1280`, `DATASET_DIR`, `EMBEDDING_DB`, `MATCH_THRESHOLD`, `CAPTURE_DELAY_SECONDS`, `CAPTURE_IMAGES_PER_SESSION`, and `MIN_LIVENESS_SCORE`.

---

### 3. Fixed `extract_palm()` Return-Value Tuple Mismatch (Fix 3)
- **Files:** `palm_ml/capture.py`, `palm_ml/register.py`, `palm_ml/recognize.py`
- **Issue:** `extract_palm()` returns `(cropped_image, num_hands)`, but offline scripts treated it as a single object, causing truthy checks to pass even on failed detections and calling `get_embedding` on tuples.
- **Resolution:** Unpacked `palm, num_hands = extract_palm(...)` across all three scripts with explicit `if palm is None or num_hands != 1` guards.

---

### 4. Hardened FastAPI CORS Configuration (Fix 4)
- **File:** `palm_ml/app.py`
- **Issue:** Wildcard origin `allow_origins=["*"]` with `allow_credentials=True` violates the CORS specification.
- **Resolution:** Replaced with explicit allowed origins list configured from `ML_ALLOWED_ORIGINS` environment variable and set `allow_credentials=False`.

---

### 5. Removed Hardcoded Fallback Secrets & Secured Startup (Fix 5)
- **Files:** `backend/server.js`, `backend/controllers/authController.js`, `backend/middleware/authMiddleware.js`, `docker-compose.yml`
- **Issue:** Plaintext hardcoded secret fallback in controllers and committed secret in `docker-compose.yml`.
- **Resolution:** Added startup assertion in `server.js` failing fast in production if `JWT_SECRET` is missing. Replaced compose secret with `${JWT_SECRET}` variable expansion and updated auth middleware.

---

### 6. Anti-Spoof Liveness Floor Removed & Gated (Fix 6)
- **Files:** `palm_ml/palm_utils.py`, `palm_ml/app.py`
- **Issue:** `detect_liveness` clamped scores to `max(0.4, ...)` preventing spoof rejection, and `app.py` never enforced the score.
- **Resolution:** Removed the artificial 0.4 floor. Enforced `MIN_LIVENESS_SCORE = 0.45` in `/register` and `/verify`, rejecting presentation attacks with HTTP 422.

---

### 7. Persistent Docker Keras Weights Caching (Fix 7)
- **Files:** `palm_ml/Dockerfile`, `docker-compose.yml`
- **Resolution:** Added `keras_cache` volume mapped to `/root/.keras/models` to prevent model weight re-downloads during cold starts in container environments.

---

### 8. Biometric Threshold Calibration Tool (Fix 8)
- **File:** `palm_ml/calibrate_thresholds.py`
- **Resolution:** Created calibration tool that computes genuine-vs-impostor score distributions, False Accept Rate (FAR), and False Reject Rate (FRR) across candidate thresholds (Genuine Mean: ~0.91, Impostor Mean: ~0.43, EER: ~0.80).

---

### 9. Comprehensive Biometric Pytest Suite (Fix 9)
- **File:** `palm_ml/tests/test_biometrics.py`
- **Resolution:** Added discriminability tests (asserting same palm $>0.95$ similarity, distinct palms $<0.65$ similarity), 1:1 verify logic tests, and 1:N candidate identification tests.
