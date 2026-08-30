import os
import pickle
import cv2

from config import CAMERA_INDEX, EMBEDDING_DB, MATCH_THRESHOLD
from palm_utils import create_hands, extract_palm, cosine_similarity
from embedding import get_embedding

def load_database():
    if not os.path.isfile(EMBEDDING_DB):
        raise SystemExit("Embedding database not found. Run register.py first.")
    with open(EMBEDDING_DB, "rb") as f:
        database = pickle.load(f)
    if not database:
        raise SystemExit("Embedding database is empty.")
    return database

def find_best_match(vector, database):
    best_user = "Unknown"
    best_score = -1.0

    for user, stored_vector in database.items():
        score = cosine_similarity(vector, stored_vector)
        if score > best_score:
            best_user = user
            best_score = score

    if best_score < MATCH_THRESHOLD:
        return "Unknown", best_score
    return best_user, best_score

def main():
    database = load_database()
    cap = cv2.VideoCapture(CAMERA_INDEX)

    if not cap.isOpened():
        raise SystemExit("Could not open camera. Check permissions or CAMERA_INDEX.")

    hands = create_hands(static_image_mode=False)
    print("Recognition started. Q = quit")

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                print("Could not read camera frame.")
                break

            frame = cv2.flip(frame, 1)
            palm, num_hands = extract_palm(frame, hands)

            name = "No palm detected"
            score = 0.0

            if palm is not None and num_hands == 1:
                try:
                    vector = get_embedding(palm)
                    name, score = find_best_match(vector, database)
                except Exception as exc:
                    name = "Embedding error"
                    print("[ERROR]", exc)
            elif num_hands > 1:
                name = "Multiple hands detected"

            cv2.putText(frame, f"User: {name}", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            cv2.putText(frame, f"Similarity: {score:.3f}", (20, 75),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Threshold: {MATCH_THRESHOLD:.2f}", (20, 105),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            cv2.imshow("Palm Recognition Demo", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        cap.release()
        hands.close()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
