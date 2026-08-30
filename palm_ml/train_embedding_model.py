"""
Palm Pay — Deep Metric Learning Embedding Trainer
Scaffolding for fine-tuning MobileNetV2 with Triplet Loss / ArcFace on palmprint datasets.

Usage:
    python train_embedding_model.py --dataset_dir ./dataset --epochs 25 --batch_size 32
"""

import os
import argparse
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Input, Lambda
from tensorflow.keras.models import Model
import tensorflow.keras.backend as K

from config import IMAGE_SIZE, EMBEDDING_DIM, BASE_DIR

MODEL_CHECKPOINT_PATH = os.path.join(BASE_DIR, "models", "palm_embedding_fine_tuned.keras")


def triplet_loss(alpha=0.2):
    """
    Triplet loss enforcing L2 distance between anchor and positive to be smaller
    than distance between anchor and negative by at least margin alpha.
    """
    def loss(y_true, y_pred):
        # y_pred has shape (batch_size, 3 * EMBEDDING_DIM)
        anchor = y_pred[:, 0:EMBEDDING_DIM]
        positive = y_pred[:, EMBEDDING_DIM:2 * EMBEDDING_DIM]
        negative = y_pred[:, 2 * EMBEDDING_DIM:3 * EMBEDDING_DIM]

        pos_dist = K.sum(K.square(anchor - positive), axis=1)
        neg_dist = K.sum(K.square(anchor - negative), axis=1)

        basic_loss = pos_dist - neg_dist + alpha
        return K.maximum(basic_loss, 0.0)

    return loss


def build_embedding_backbone():
    """
    Constructs the trainable embedding network:
    MobileNetV2 + Spatial Pooling + Dense Projection Head + L2 Normalization.
    """
    base = MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3),
    )
    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(EMBEDDING_DIM, activation=None, name="palm_embedding_dense")(x)
    # L2 normalize embeddings
    embedding = Lambda(lambda v: K.l2_normalize(v, axis=1), name="l2_norm")(x)

    model = Model(inputs=base.input, outputs=embedding, name="PalmEmbeddingModel")
    return model


def build_triplet_training_network(embedding_model):
    """
    Shared-weights Siamese network for 3 inputs: Anchor, Positive, Negative.
    """
    in_anchor = Input(shape=(IMAGE_SIZE, IMAGE_SIZE, 3), name="anchor_input")
    in_pos = Input(shape=(IMAGE_SIZE, IMAGE_SIZE, 3), name="positive_input")
    in_neg = Input(shape=(IMAGE_SIZE, IMAGE_SIZE, 3), name="negative_input")

    emb_anchor = embedding_model(in_anchor)
    emb_pos = embedding_model(in_pos)
    emb_neg = embedding_model(in_neg)

    out = Lambda(lambda vecs: K.concatenate(vecs, axis=1))([emb_anchor, emb_pos, emb_neg])

    triplet_net = Model(inputs=[in_anchor, in_pos, in_neg], outputs=out, name="TripletNetwork")
    return triplet_net


class PalmTripletDataGenerator(tf.keras.utils.Sequence):
    """
    Generates triplets (Anchor, Positive, Negative) from multi-image user folders in dataset_dir.
    """
    def __init__(self, dataset_dir, batch_size=32):
        self.dataset_dir = dataset_dir
        self.batch_size = batch_size
        self.users = [
            u for u in sorted(os.listdir(dataset_dir))
            if os.path.isdir(os.path.join(dataset_dir, u))
        ]
        self.user_images = {}
        for u in self.users:
            u_dir = os.path.join(dataset_dir, u)
            imgs = [
                os.path.join(u_dir, f) for f in os.listdir(u_dir)
                if f.lower().endswith((".jpg", ".png", ".jpeg"))
            ]
            if len(imgs) >= 2:
                self.user_images[u] = imgs

        self.valid_users = list(self.user_images.keys())

    def __len__(self):
        return max(1, len(self.valid_users) * 5)

    def __getitem__(self, index):
        if len(self.valid_users) < 2:
            # Dummy random triplet batch for testing when dataset is empty
            dummy = np.zeros((self.batch_size, IMAGE_SIZE, IMAGE_SIZE, 3), dtype=np.float32)
            return [dummy, dummy, dummy], np.zeros(self.batch_size)

        anchors, positives, negatives = [], [], []
        for _ in range(self.batch_size):
            anchor_user = np.random.choice(self.valid_users)
            neg_user = np.random.choice([u for u in self.valid_users if u != anchor_user])

            a_img_path, p_img_path = np.random.choice(self.user_images[anchor_user], size=2, replace=False)
            n_img_path = np.random.choice(self.user_images[neg_user])

            # In production, load and preprocess image with CLAHE
            # ...
        return [np.zeros((self.batch_size, IMAGE_SIZE, IMAGE_SIZE, 3)),
                np.zeros((self.batch_size, IMAGE_SIZE, IMAGE_SIZE, 3)),
                np.zeros((self.batch_size, IMAGE_SIZE, IMAGE_SIZE, 3))], np.zeros(self.batch_size)


def main():
    parser = argparse.ArgumentParser(description="Train Palmprint Metric Learning Embeddings")
    parser.add_argument("--dataset_dir", type=str, default=os.path.join(BASE_DIR, "dataset"))
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=1e-4)
    args = parser.parse_args()

    print("[INFO] Initializing Palmprint Deep Metric Learning Scaffolding...")
    backbone = build_embedding_backbone()
    triplet_net = build_triplet_training_network(backbone)

    triplet_net.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=args.lr),
        loss=triplet_loss(alpha=0.25),
    )

    print("[INFO] Model architecture compiled.")
    print(f"[INFO] Backbone output embedding dimension: {EMBEDDING_DIM}")
    print("[INFO] Supply real palmprint dataset (e.g. CASIA / IITD / Tongji) to begin metric-learning fine-tuning.")


if __name__ == "__main__":
    main()
