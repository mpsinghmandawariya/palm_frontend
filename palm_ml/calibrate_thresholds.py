"""
Palm Pay — Biometric Threshold Calibration Tool
Computes genuine-vs-impostor score distributions, False Accept Rate (FAR),
False Reject Rate (FRR), and Equal Error Rate (EER) to calibrate match thresholds.

Usage:
    python calibrate_thresholds.py [--dataset_dir ./dataset]
"""

import os
import argparse
import cv2
import numpy as np
from itertools import combinations

from config import DATASET_DIR, MATCH_THRESHOLD_VERIFY, MATCH_THRESHOLD_IDENTIFY
from palm_utils import create_hands, extract_palm, cosine_similarity
from embedding import get_embedding


def generate_synthetic_samples():
    """
    Generates controlled synthetic palm samples with different principal lines
    when no physical dataset is populated yet.
    """
    users = {}
    patterns = [
        # User 1: Horizontal principal lines
        [((30, 90), (190, 90)), ((40, 130), (180, 140)), ((50, 160), (170, 170))],
        # User 2: Diagonal/curved principal lines
        [((40, 60), (160, 180)), ((60, 40), (180, 160)), ((30, 110), (170, 130))],
        # User 3: Central circular / radial lines
        [((50, 80), (170, 80)), ((110, 40), (110, 180)), ((40, 140), (180, 60))],
    ]

    for idx, lines in enumerate(patterns):
        username = f"User_{idx + 1}"
        samples = []
        for v in range(4):
            img = np.full((224, 224, 3), 170 + v * 8, dtype=np.uint8)
            cv2.circle(img, (112, 112), 75, (150, 130, 110), -1)
            for (pt1, pt2) in lines:
                p1 = (pt1[0] + np.random.randint(-2, 3), pt1[1] + np.random.randint(-2, 3))
                p2 = (pt2[0] + np.random.randint(-2, 3), pt2[1] + np.random.randint(-2, 3))
                cv2.line(img, p1, p2, (30 + v * 4, 30 + v * 4, 30 + v * 4), 3)
            samples.append(img)
        users[username] = samples
    return users


def collect_dataset_embeddings(dataset_dir):
    user_embeddings = {}

    if os.path.isdir(dataset_dir):
        hands = create_hands(static_image_mode=True)
        try:
            for user in sorted(os.listdir(dataset_dir)):
                u_dir = os.path.join(dataset_dir, user)
                if not os.path.isdir(u_dir):
                    continue
                vectors = []
                for fname in sorted(os.listdir(u_dir)):
                    if not fname.lower().endswith((".jpg", ".png", ".jpeg")):
                        continue
                    path = os.path.join(u_dir, fname)
                    img = cv2.imread(path)
                    if img is None:
                        continue
                    palm, num_hands = extract_palm(img, hands)
                    if palm is not None and num_hands == 1:
                        vectors.append(get_embedding(palm))
                if len(vectors) >= 2:
                    user_embeddings[user] = vectors
        finally:
            hands.close()

    if len(user_embeddings) < 2:
        print("[INFO] Running calibration on synthetic benchmark palm patterns...")
        samples_dict = generate_synthetic_samples()
        for u, imgs in samples_dict.items():
            user_embeddings[u] = [get_embedding(img) for img in imgs]

    return user_embeddings


def main():
    parser = argparse.ArgumentParser(description="Calibrate Palm Biometric Match Thresholds")
    parser.add_argument("--dataset_dir", type=str, default=DATASET_DIR)
    args = parser.parse_args()

    user_embeddings = collect_dataset_embeddings(args.dataset_dir)
    if len(user_embeddings) < 2:
        print("[ERROR] At least 2 users with 2+ images required for threshold calibration.")
        return

    genuine_scores = []
    impostor_scores = []

    # 1. Genuine Pairs (Intra-user comparison)
    for u, vecs in user_embeddings.items():
        for v1, v2 in combinations(vecs, 2):
            genuine_scores.append(cosine_similarity(v1, v2))

    # 2. Impostor Pairs (Inter-user comparison)
    users = list(user_embeddings.keys())
    for u1, u2 in combinations(users, 2):
        for v1 in user_embeddings[u1]:
            for v2 in user_embeddings[u2]:
                impostor_scores.append(cosine_similarity(v1, v2))

    print(f"\n========================================================")
    print(f"PALM BIOMETRIC THRESHOLD CALIBRATION REPORT")
    print(f"Users: {len(users)} | Genuine Pairs: {len(genuine_scores)} | Impostor Pairs: {len(impostor_scores)}")
    print(f"========================================================")
    print(f"Genuine Mean: {np.mean(genuine_scores):.4f} (±{np.std(genuine_scores):.4f})")
    print(f"Impostor Mean: {np.mean(impostor_scores):.4f} (±{np.std(impostor_scores):.4f})\n")

    print(f"{'Threshold':<12} | {'FAR (False Accept)':<20} | {'FRR (False Reject)':<20}")
    print("-" * 58)

    best_eer_thresh = 0.65
    min_eer_diff = 100.0

    for thresh in np.arange(0.50, 0.92, 0.02):
        far = np.mean([1.0 if s >= thresh else 0.0 for s in impostor_scores]) * 100
        frr = np.mean([1.0 if s < thresh else 0.0 for s in genuine_scores]) * 100
        print(f"{thresh:.2f}         | {far:>6.2f}%              | {frr:>6.2f}%")

        if abs(far - frr) < min_eer_diff:
            min_eer_diff = abs(far - frr)
            best_eer_thresh = thresh

    print("-" * 58)
    print(f"Equal Error Rate (EER) Threshold: ~{best_eer_thresh:.2f}")
    print(f"Calibrated 1:1 Verify Threshold: {MATCH_THRESHOLD_VERIFY:.2f}")
    print(f"Calibrated 1:N Identify Threshold: {MATCH_THRESHOLD_IDENTIFY:.2f}")
    print(f"========================================================\n")


if __name__ == "__main__":
    main()
