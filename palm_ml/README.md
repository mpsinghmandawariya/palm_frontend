# Palm Pay — Machine Learning Biometric Service

FastAPI Python microservice running MediaPipe Hands for palm landmark detection, biometric feature extraction, anti-spoof presentation attack detection, and cosine similarity matching.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Service
```bash
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Interactive API Docs
Visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for auto-generated Swagger OpenAPI documentation.

### 4. Run Automated Biometric Tests
```bash
python -m pytest tests/test_biometrics.py -v
```

---

## 🧠 Biometric Engine Architecture

### 1. Single Source of Truth: `EMBEDDING_DIM = 1280`
The embedding dimension is defined centrally in `config.py` as `EMBEDDING_DIM = 1280` and shared across:
- `palm_ml/app.py`: `/register`, `/verify`, `/identify` validation
- `backend/models/PalmProfile.js`: Mongoose schema validation
- `backend/controllers/posController.js`: 1:N candidate query

### 2. Hybrid Discriminative Embedding Pipeline (`embedding.py`)
To prevent the "static" non-discriminating matching caused by generic ImageNet average pooling, `get_embedding(image)` implements a multi-scale spatial texture representation:
1. **Grayscale + CLAHE Preprocessing**: Suppresses skin tone and illumination variance while accentuating dermal ridges and crease structures.
2. **Multi-Scale Spatial Uniform LBP (640-d)**: Captures micro-texture and crease topology across 4x4 spatial grid cells.
3. **Directional Crease Gradient Histograms (384-d)**: Captures directional gradient distributions along principal lines.
4. **Multi-Orientation Gabor Wavelet Filters (256-d)**: Analyzes 8 principal line angles (0°, 22.5°, 45°, 67.5°, 90°, 112.5°, 135°, 157.5°).
5. **Mean-Centered $L_2$ Normalization**: Yields a unit-vector on the hypersphere with $\sim 1.0$ genuine similarity and $< 0.60$ impostor similarity.

---

## 🛠️ Offline Tooling & Calibration

### 1. Empirical Threshold Calibration (`calibrate_thresholds.py`)
Computes genuine-vs-impostor score distributions, False Accept Rate (FAR), False Reject Rate (FRR), and Equal Error Rate (EER):
```bash
python calibrate_thresholds.py [--dataset_dir ./dataset]
```
- **Calibrated 1:1 Verify Threshold**: `0.65`
- **Calibrated 1:N Identify Threshold**: `0.78`
- **EER Point**: `~0.80`

### 2. Deep Metric Learning Fine-Tuning Scaffolding (`train_embedding_model.py`)
Provides Triplet Loss and ArcFace training scaffolding for fine-tuning MobileNetV2 when a real palmprint dataset (e.g. CASIA, IITD, Tongji) is provided in `dataset/<user_id>/*.jpg`:
```bash
python train_embedding_model.py --dataset_dir ./dataset --epochs 25 --batch_size 32
```
If a trained checkpoint `models/palm_embedding_fine_tuned.keras` is placed in `models/`, `embedding.py` will automatically load and prioritize it.

### 3. Dataset Capture, Batch Enrollment & Live Demo
- **Capture**: `python capture.py` (auto-captures palm images per user with on-screen visual feedback).
- **Register**: `python register.py` (processes dataset folder and compiles `embeddings/embeddings.pkl`).
- **Recognize**: `python recognize.py` (real-time camera recognition demo against `embeddings.pkl`).

---

## 🔒 Security & Liveness Gating

- **Quality Floor**: `MIN_REGISTRATION_QUALITY = 0.35` gates blurry or poorly illuminated images.
- **Anti-Spoofing Gate**: `MIN_LIVENESS_SCORE = 0.45` checks high-frequency spatial spectrum and color dispersion, rejecting flat photos, paper printouts, and screen replays with HTTP `422`.
- **CORS Allowlist**: Explicit allowlist configured via `ML_ALLOWED_ORIGINS` environment variable.
- **Docker Pre-Trained Weights Cache**: `~/.keras/models` volume mapped in Docker Compose to ensure fast, offline-capable container startups.
