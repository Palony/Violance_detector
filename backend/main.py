import cv2
import base64
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from ultralytics import YOLO
import asyncio
from collections import deque

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Model nano, 60 epok, źle wytrenowany
# model = YOLO("best.pt")

#model medium, 25 epok, w miarę wytrenowany pozwalający na wykrywanie przemocy, ale z dużą ilością niepoprawnych decyzji
#Dla przykładu wykrywa mnie przed komputerem, w niektorych pozycjach jako ,,przemoc"
#Aby działało to poprawnie należy użyć lepszego modelu np. large i więcej epok, ale niestety potrzeba wiele czasu na to
model = YOLO("best_medium_25epochs.pt")
cap = None


detection_queue = deque(maxlen=20)


def generate_frames():
    global cap

    if cap is None or not cap.isOpened():
        cap = cv2.VideoCapture(0)

    try:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            results = model(frame, stream=True, conf=0.8)
            for r in results:
                if r.boxes and len(r.boxes) > 0:
                    annotated = r.plot()


                    ret, buffer = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 70])
                    if ret:
                        img_b64 = base64.b64encode(buffer).decode("utf-8")
                        names = r.names
                        detected_classes = [names[int(c)] for c in r.boxes.cls]
                        label = detected_classes[0] if detected_classes else "Unknown"
                        conf = float(r.boxes.conf[0])

                        detection_queue.append({
                            "label": label,
                            "conf": round(conf, 2),
                            "image": img_b64,
                        })

                    frame = annotated
                else:
                    frame = r.plot()

            ret, buffer = cv2.imencode(".jpg", frame)
            if not ret:
                continue

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n"
            )

    except Exception as e:
        print(f"Strumień przerwany: {e}")
    finally:
        if cap is not None:
            cap.release()
            cap = None
            print("Kamera zwolniona.")


@app.get("/video_feed")
def video_feed():
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@app.get("/detections")
async def detections():
    async def event_stream():
        last_len = 0
        while True:
            if len(detection_queue) > last_len:
                item = list(detection_queue)[-1]
                last_len = len(detection_queue)
                import json
                yield f"data: {json.dumps(item)}\n\n"
            await asyncio.sleep(0.3)

    return StreamingResponse(event_stream(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)