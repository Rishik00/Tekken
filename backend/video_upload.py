from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
import shutil
import os
from time import perf_counter
from intel.toolkit.gesture_function import run_gesture_recognition

app = FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

video_dir = os.path.join(BASE_DIR, "temp_videos")

# os.makedirs(video_dir, exist_ok=True)
@app.post("/upload-video-file/")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    A function to handle the upload of a video file, process it for gesture recognition,
    and return processing results. Parameters include background_tasks of type BackgroundTasks,
    and file of type UploadFile. Returns JSONResponse with message, labels, upload-time, and performance_time.
    """
    
    if(not os.path.exists(video_dir)):
        os.makedirs(video_dir, exist_ok=True)
    
    video_path = os.path.join(video_dir, file.filename)
    
    start_time = perf_counter()

    
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    upload_time = perf_counter() - start_time
    print(f"File upload and save time: {upload_time:.2f} seconds")

    
    action_model = os.path.join(BASE_DIR, "intel", "asl-recognition-0004", "FP16", "asl-recognition-0004.xml")
    detection_model = os.path.join(BASE_DIR, "intel", "person-detection-asl-0001", "FP16", "person-detection-asl-0001.xml")
    class_map_path = os.path.join(BASE_DIR, "intel", "msasl100.json")
    device = "CPU"  

    
    processing_start_time = perf_counter()
    
    labels = run_gesture_recognition(
        action_model,
        detection_model,
        video_path,
        class_map_path=class_map_path,
        device=device,
        no_show=True
    )

    processing_time = perf_counter() - processing_start_time
    print(f"Video processing time: {processing_time:.2f} seconds")

    if os.path.exists(video_dir):
        shutil.rmtree(video_dir)

    return JSONResponse(content={"message": "Video received and processing started.", "labels": list(labels), "upload-time":upload_time, "performance_time": processing_time}, status_code=200)


if __name__=="__main__":
    print("Started")