import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from config import IMAGE_SIZE

_MODEL = None

def get_model():
    global _MODEL
    if _MODEL is None:
        _MODEL = MobileNetV2(
            weights="imagenet",
            include_top=False,
            pooling="avg",
            input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3),
        )
    return _MODEL

def get_embedding(image):
    if image is None or image.size == 0:
        raise ValueError("Empty image supplied.")

    if image.ndim == 2:
        image = np.stack([image, image, image], axis=-1)
    elif image.shape[-1] == 4:
        image = image[:, :, :3]
    elif image.shape[-1] != 3:
        raise ValueError("Expected a 3-channel image.")

    batch = np.expand_dims(image.astype(np.float32), 0)
    batch = preprocess_input(batch)
    vector = get_model().predict(batch, verbose=0)[0].astype(np.float32)

    norm = np.linalg.norm(vector)
    if norm == 0:
        raise ValueError("Generated embedding has zero norm.")

    return vector / norm
