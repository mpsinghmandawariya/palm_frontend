def main():
    print("Testing Palm ML environment...")

    for module_name, display_name in [
        ("numpy", "numpy"),
        ("cv2", "opencv"),
        ("mediapipe", "mediapipe"),
        ("tensorflow", "tensorflow"),
    ]:
        try:
            module = __import__(module_name)
            if module_name == "mediapipe":
                import mediapipe as mp

                if not hasattr(mp, "solutions") or not hasattr(mp.solutions, "hands"):
                    raise RuntimeError(
                        "installed MediaPipe does not include mp.solutions.hands; "
                        "run: python -m pip install --force-reinstall -r requirements.txt"
                    )
            print(f"[OK] {display_name}: {getattr(module, '__version__', 'installed')}")
        except Exception as exc:
            print(f"[FAIL] {display_name}: {exc}")

    print("\nIf all four are [OK], run: python capture.py")

if __name__ == "__main__":
    main()
