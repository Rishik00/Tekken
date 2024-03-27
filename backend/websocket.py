import asyncio
import websockets

async def video_stream(websocket, path):
    async for frame in websocket:
        # Process incoming video frames as needed
        print("Received video frame")

start_server = websockets.serve(video_stream, "192.168.29.52", 8888)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
