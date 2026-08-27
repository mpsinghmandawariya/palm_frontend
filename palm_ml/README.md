# Palm Pay ML Prototype

Standalone prototype for palm capture, hand localization, embeddings, and similarity matching.

## Pipeline
Camera/images -> MediaPipe hand localization -> normalized hand crop -> MobileNetV2 embedding -> cosine similarity -> best match.

This is a research/demo prototype, not production biometric authentication. Do not use its match result as the sole authorization mechanism for real financial transactions.

## Recommended Python
Python 3.10 or 3.11.

## Install
```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If `capture.py` fails with `module 'mediapipe' has no attribute 'solutions'`,
reinstall the pinned dependencies:

```bash
python -m pip install --force-reinstall -r requirements.txt
```

## Run
1. Capture enrolled images:
```bash
python capture.py
```
Enter a username and capture about 30-50 images. Repeat for every person.

2. Build the embedding database:
```bash
python register.py
```

3. Run live recognition:
```bash
python recognize.py
```
Press Q to quit.

## Dataset layout
```text
dataset/
  mahipal/
    0000.jpg
    0001.jpg
  user2/
    0000.jpg
    0001.jpg
```

The first TensorFlow model initialization may download MobileNetV2 ImageNet weights.
