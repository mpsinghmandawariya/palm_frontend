import os
import pickle
import cv2
import numpy as np

from config import DATASET_DIR, EMBEDDING_DB
from palm_utils import create_hands, extract_palm
from embedding import get_embedding

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

def main():
    if not os.path.isdir(DATASET_DIR):
        raise SystemExit("dataset/ not found. Run capture.py first.")

    database = {}
    total = 0

    for user in sorted(os.listdir(DATASET_DIR)):
        user_path = os.path.join(DATASET_DIR, user)
        if not os.path.isdir(user_path):
            continue

        vectors = []
        hands = create_hands(static_image_mode=True)
        try:
            for filename in sorted(os.listdir(user_path)):
                if os.path.splitext(filename)[1].lower() not in VALID_EXTENSIONS:
                    continue
                path = os.path.join(user_path, filename)
                image = cv2.imread(path)
                if image is None:
                    print("[WARN] Could not read:", path)
                    continue

                palm = extract_palm(image, hands)
                if palm is None:
                    print("[WARN] No hand detected:", path)
                    continue

                try:
                    vectors.append(get_embedding(palm))
                    total += 1
                except Exception as exc:
                    print("[WARN] Embedding failed:", path, exc)
        finally:
            hands.close()

        if not vectors:
            print("[WARN] No usable images for:", user)
            continue

        mean_vector = np.mean(np.stack(vectors), axis=0).astype(np.float32)
        norm = np.linalg.norm(mean_vector)
        if norm == 0:
            print("[WARN] Zero embedding for:", user)
            continue

        database[user] = mean_vector / norm
        print(f"[OK] {user}: {len(vectors)} usable images")

    if not database:
        raise SystemExit("No users registered. Add usable palm images.")

    os.makedirs(os.path.dirname(EMBEDDING_DB), exist_ok=True)
    with open(EMBEDDING_DB, "wb") as f:
        pickle.dump(database, f)

    print(f"Created {EMBEDDING_DB}: {len(database)} users, {total} images.")

if __name__ == "__main__":
    main()
