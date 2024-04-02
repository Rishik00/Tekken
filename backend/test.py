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


def append_to_file(file_path, text):
    """
    Append text to a file.

    Args:
        file_path (str): The path to the file.
        text (str): The text to append.
    """
    try:
        with open(file_path, 'a') as file:
            file.write(text)
            file.write('\n')  # Add a newline after each text if desired
        print("Text appended successfully to", file_path)
    except Exception as e:
        print("Error:", e)


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
        frame = await self.track.recv()

        if self.transform == "cartoon":
            img = frame.to_ndarray(format="bgr24")
            # append_to_file("file.txt", img.shape)
            # print(img.shape)

            # prepare color
            img_color = cv2.pyrDown(cv2.pyrDown(img))
            for _ in range(6):
                img_color = cv2.bilateralFilter(img_color, 9, 9, 7)
            img_color = cv2.pyrUp(cv2.pyrUp(img_color))

            # prepare edges
            img_edges = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
            img_edges = cv2.adaptiveThreshold(
                cv2.medianBlur(img_edges, 7),
                255,
                cv2.ADAPTIVE_THRESH_MEAN_C,
                cv2.THRESH_BINARY,
                9,
                2,
            )
            img_edges = cv2.cvtColor(img_edges, cv2.COLOR_GRAY2RGB)

            # combine color and edges
            img = cv2.bitwise_and(img_color, img_edges)

            # rebuild a VideoFrame, preserving timing information
            new_frame = VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            # print("yes")
            return new_frame
        elif self.transform == "edges":
            # perform edge detection
            img = frame.to_ndarray(format="bgr24")
            img = cv2.cvtColor(cv2.Canny(img, 100, 200), cv2.COLOR_GRAY2BGR)

            # rebuild a VideoFrame, preserving timing information
            new_frame = VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            return new_frame
        elif self.transform == "rotate":
            # rotate image
            img = frame.to_ndarray(format="bgr24")
            rows, cols, _ = img.shape
            M = cv2.getRotationMatrix2D((cols / 2, rows / 2), frame.time * 45, 1)
            img = cv2.warpAffine(img, M, (cols, rows))

            # rebuild a VideoFrame, preserving timing information
            new_frame = VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            return new_frame
        else:
            return frame



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
            recorder = MediaRecorder("sample.mp4")
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
    uvicorn.run("test:app", host="0.0.0.0", port=8000, reload="True")
