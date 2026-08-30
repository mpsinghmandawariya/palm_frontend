# Palm Pay — Machine Learning Biometric Service

FastAPI Python microservice running MediaPipe Hands for palm landmark detection and MobileNetV2 for 1280-dimensional biometric embedding extraction.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Service
```bash
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Interactive API Docs
Visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for auto-generated Swagger OpenAPI documentation.

### 4. Run Unit Tests
```bash
pytest
```

## 🧠 Biometric Engine
- **Palm ROI Extraction**: MediaPipe hand landmark tracking detects bounding box and orientation. Multi-hand frames are rejected with `422`.
- **Feature Embedding**: MobileNetV2 extracts normalized 1280-d feature vectors.
- **Matching Modes**:
  - `POST /verify`: 1:1 Cosine similarity ($\ge 0.65$).
  - `POST /identify`: 1:N Linear scan ($\ge 0.78$) across candidate embeddings.
- **Quality & Liveness**: Laplacian variance sharpness calculation and FFT high-frequency presentation attack detection.
