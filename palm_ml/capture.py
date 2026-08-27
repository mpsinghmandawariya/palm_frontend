import os
import time
import cv2

from config import (
    CAMERA_INDEX,
    CAPTURE_DELAY_SECONDS,
    CAPTURE_IMAGES_PER_SESSION,
    DATASET_DIR,
)
from palm_utils import create_hands, extract_palm

CAPTURE_KEYS = {32, ord("s"), ord("c"), 13}
PAUSE_KEYS = {ord("p"), ord("a")}
QUIT_KEYS = {ord("q"), 27}
WINDOW_NAME = "Palm Capture"

def save_image(save_dir, count, frame):
    filename = os.path.join(save_dir, f"{count:04d}.jpg")
    if not cv2.imwrite(filename, frame):
        print("[ERROR] Could not save:", filename)
        return False
    print("Saved:", filename)
    return True

def main():
    user = input("Enter user name: ").strip()
    if not user:
        raise SystemExit("User name cannot be empty.")

    save_dir = os.path.join(DATASET_DIR, user)
    os.makedirs(save_dir, exist_ok=True)

    existing = [f for f in os.listdir(save_dir) if f.lower().endswith(".jpg")]
    count = len(existing)
    target_count = count + CAPTURE_IMAGES_PER_SESSION

    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        raise SystemExit("Could not open camera. Check permissions or CAMERA_INDEX.")

    hands = create_hands(static_image_mode=False)
    auto_capture = True
    last_auto_capture = 0.0
    status_message = "Auto capture ON"
    print("Saving images to:", save_dir)
    print(
        f"Auto-capturing {CAPTURE_IMAGES_PER_SESSION} images. "
        "P/A = pause/resume | S/C/SPACE = manual capture | Q/ESC = quit"
    )

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                print("Could not read camera frame.")
                break

            frame = cv2.flip(frame, 1)
            preview = frame.copy()
            palm = extract_palm(frame, hands)
            palm_detected = palm is not None

            if palm_detected:
                cv2.putText(preview, "Palm detected", (20, 115),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)
            else:
                cv2.putText(preview, "Saving full frames - show one hand clearly", (20, 115),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 2)

            cv2.putText(preview, f"User: {user}  Captured: {count}", (20,35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)
            cv2.putText(preview, f"Target this run: {target_count}", (20,65),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255,255,255), 2)
            cv2.putText(preview, "P/A: pause   S/C/SPACE: save now   Q/ESC: quit", (20,90),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255,255,255), 2)
            cv2.putText(preview, status_message, (20,145),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255,255,0), 2)

            cv2.imshow(WINDOW_NAME, preview)
            raw_key = cv2.waitKeyEx(1)
            key = raw_key & 0xFF if raw_key != -1 else -1

            now = time.time()
            should_auto_capture = (
                auto_capture
                and count < target_count
                and now - last_auto_capture >= CAPTURE_DELAY_SECONDS
            )

            if key in CAPTURE_KEYS or should_auto_capture:
                if save_image(save_dir, count, frame):
                    count += 1
                    last_auto_capture = now
                    status_message = f"Saved image {count - 1:04d}"
                else:
                    raise SystemExit("Image saving failed. Check dataset folder permissions.")
            elif key in PAUSE_KEYS:
                auto_capture = not auto_capture
                status_message = "Auto capture ON" if auto_capture else "Auto capture OFF"
            elif key in QUIT_KEYS:
                break

            if count >= target_count:
                print(f"Captured {CAPTURE_IMAGES_PER_SESSION} new images for {user}.")
                break

            if cv2.getWindowProperty(WINDOW_NAME, cv2.WND_PROP_VISIBLE) < 1:
                break
    finally:
        cap.release()
        hands.close()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
