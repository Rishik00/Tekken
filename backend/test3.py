from fastapi import FastAPI, WebSocket
from aiortc import RTCPeerConnection, MediaStreamTrack, RTCSessionDescription, RTCIceCandidate
from aiortc.contrib.media import MediaBlackhole, MediaRelay, MediaPlayer, MediaRecorder
import aiortc.mediastreams as ms
import uuid
import json
import os
import cv2
from av import VideoFrame
ROOT = os.path.dirname(__file__)

app = FastAPI()

relay = MediaRelay()  # Provide the path to where you want to record

# This dictionary stores the peer connections
peer_connections = {}

import sys
from pathlib import Path
import numpy as np

sys.path.append(str(Path(__file__).resolve().parents[2] / 'common/python'))
sys.path.append(str(Path(__file__).resolve().parents[2] / 'common/python/model_zoo'))

from intel.toolkit.gesture_recognition_demo.common import load_core
from intel.toolkit.gesture_recognition_demo.video_library import VideoLibrary
from intel.toolkit.gesture_recognition_demo.person_detector import PersonDetector
from intel.toolkit.gesture_recognition_demo.tracker import Tracker
from intel.toolkit.gesture_recognition_demo.action_recognizer import ActionRecognizer
from intel.toolkit.model_api.performance_metrics import PerformanceMetrics

DETECTOR_OUTPUT_SHAPE = -1, 5
TRACKER_SCORE_THRESHOLD = 0.4
TRACKER_IOU_THRESHOLD = 0.3
ACTION_IMAGE_SCALE = 256
OBJECT_IDS = [ord(str(n)) for n in range(10)]
action_model = os.path.join(ROOT, "intel", "asl-recognition-0004", "FP16", "asl-recognition-0004.xml")
detection_model = os.path.join(ROOT, "intel", "person-detection-asl-0001", "FP16", "person-detection-asl-0001.xml")
class_map_path = os.path.join(ROOT, "intel", "msasl100.json")

def load_class_map( file_path):
    if file_path is not None and os.path.exists(file_path):
        with open(file_path, 'r') as input_stream:
            print("Loading class map from", file_path)
            data = json.load(input_stream)
            return dict(enumerate(data))
    return None
device = 'CPU'
core = load_core()
class_map = load_class_map(class_map_path)
person_detector = PersonDetector(detection_model, device, core, num_requests=2, output_shape=DETECTOR_OUTPUT_SHAPE)
action_recognizer = ActionRecognizer(action_model, device, core, num_requests=2, img_scale=ACTION_IMAGE_SCALE, num_classes=len(class_map))
person_tracker = Tracker(person_detector, TRACKER_SCORE_THRESHOLD, TRACKER_IOU_THRESHOLD)
metrics = PerformanceMetrics()
action_threshold = 0.8


class WebSocketVideoStream:
    def __init__(self):
        self.frames = []

    def add_frame(self, frame):
        self.frames.append(frame)
    
    def len_frame(self):
        return len(self.frames)

    def get_live_frame(self):
        if self.frames:
            return self.frames[-1]
        return None

    def get_batch(self, batch_size):
        if len(self.frames) >= batch_size:
            batch = self.frames[-batch_size:]
            self.frames = self.frames[-16:]
            return batch
        return None
    

video_stream = WebSocketVideoStream()

class VideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from another track.
    """

    kind = "video"

    def __init__(self, track, transform):
        super().__init__()  # don't forget this!
        self.track = track
        self.transform = transform

    async def recv(self):
        rawFrame = await self.track.recv()
        frame = rawFrame.to_ndarray(format="bgr24")
        video_stream.add_frame(frame)
        # print(action_recognizer.input_length)
        # print(frame.shape)
        # print(video_stream.len_frame())
        batch = video_stream.get_batch(action_recognizer.input_length)
        try:
            if batch:
                print("running")
                detections, _ = person_tracker.add_frame(frame, len(OBJECT_IDS), {})
                if detections is not None:
                    for detection in detections:
                        # print(detection.roi.reshape(-1))
                        # print("running")
                        recognizer_result = action_recognizer(batch, detection.roi.reshape(-1))
                        if recognizer_result is not None:
                            action_class_id = np.argmax(recognizer_result)
                            action_score = np.max(recognizer_result)
                            if action_score >= action_threshold:
                                action_label = class_map[action_class_id]
                                print(f'Action ID: {action_class_id}, Score: {action_score}, Label: {action_label}')
                        else:
                            print("No recognizer result")
                else:
                    print("No detections")
            else:
                print("No batch available")
        except Exception as e:
            print(f"An error occurred: {e}")
        return rawFrame



async def handle_offer(websocket: WebSocket, pc: RTCPeerConnection, message: dict):
    print(message["offer"]["sdp"])
    offer = RTCSessionDescription(
        sdp=message["offer"]["sdp"], type=message["offer"]["type"]
    )
    await pc.setRemoteDescription(offer)
    print("set remote description")

    recorder = MediaBlackhole()
    

    answer = await pc.createAnswer()
    print(answer.sdp)
    await pc.setLocalDescription(answer)

    await websocket.send_text(json.dumps({
        "type": "answer",
        "answer": {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
    }))

async def handle_candidate(pc: RTCPeerConnection, message: dict):
    candidate_info = message["candidate"]["candidate"].split()
    candidate = RTCIceCandidate(
        candidate_info[1], candidate_info[0], candidate_info[4], 
        int(candidate_info[5]), int(candidate_info[3]), candidate_info[2], 
        candidate_info[7],
        sdpMid=message["candidate"]["sdpMid"], sdpMLineIndex=message["candidate"]["sdpMLineIndex"]
    )
    await pc.addIceCandidate(candidate)

async def handle_end_track(websocket: WebSocket, recorder: MediaBlackhole):
    await websocket.send_text(json.dumps({"type": "track_end"}))
    await recorder.stop()
    print("Track ended")


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    pc = RTCPeerConnection()
    peer_connections[client_id] = pc

    @pc.on("track")
    async def on_track(track):
        if track.kind == "video":
            pc.addTrack(
                VideoTransformTrack(
                    relay.subscribe(track), transform="cartoon"
                )
            )
              # Or use MediaRecorder to record
            recorder = MediaBlackhole()
            # recorder = MediaRecorder("sample.mp4")
            recorder.addTrack(VideoTransformTrack(relay.subscribe(track), transform="cartoon"))
            await recorder.start()
            print("Video track added and recorder started")
            @track.on("ended")
            async def on_ended():
                await recorder.stop()

    async for message in websocket.iter_text():
        message = json.loads(message)

        if message["type"] == "offer":
            await handle_offer(websocket, pc, message)
        elif message["type"] == "candidate":
            await handle_candidate(pc, message)
        elif message["type"] == "end_track":
            recorder = MediaBlackhole()
            await handle_end_track(websocket, recorder)

    # Clean up after the connection is closed
    del peer_connections[client_id]
    await pc.close()

# @app.on_event("shutdown")
# async def on_shutdown():
#     # Close all peer connections
#     for pc in peer_connections.values():
#         await pc.close()

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("test3:app", host="0.0.0.0", port=8000, reload="True")
