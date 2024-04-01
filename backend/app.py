from fastapi import FastAPI, Request, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from gemini import GetGeminiOutput
import json
from dotenv import load_dotenv
from datetime import datetime
import shutil
from time import perf_counter

# This calls the OpenVino Model
# Do no delete at all costs 💀💀💀
from intel.toolkit.gesture_function import run_gesture_recognition


# Initialize FastAPI app
app = FastAPI()

# Initialize Firebase Admin SDK
cred = credentials.Certificate("./firebase-admin.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Initialize Gemini model
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
gemini_model = GetGeminiOutput(API_KEY=GOOGLE_API_KEY, max_tokens=3000, temperature=0.7)

# Load the JSON file
with open('result.json', 'r') as json_file:
    data = json.load(json_file)

# Create a dictionary to store gloss-link mappings
gloss_link_mapping = {item['gloss']: item['link'] for item in data}

# Function to get links corresponding to words in a sentence
def get_links_for_sentence(sentence):
    words = [word.lower() for word in sentence.split()]
    result_objects = []
    for word in words:
        # Check if the word's gloss exists in the mapping
        if word in gloss_link_mapping:
            result_objects.append({
                'word': word,
                'link': gloss_link_mapping[word]
            })
    return result_objects

# Function to push a chat message to Firebase under the user's chats array
def push_chat_message(user_id, message, sender):
    user_ref = db.collection('Users').document(user_id)
    user_data = user_ref.get().to_dict()
    timestamp = datetime.now()
    if user_data is None:
        # Create the user document if it doesn't exist
        user_ref.set({
            'chats': [{'text': message, 'sender': sender, 'timestamp': timestamp}]
        })
    else:
        # Update the existing user document to add the new chat message
        user_ref.update({

            'chats': firestore.ArrayUnion([{'text': message, 'sender': sender, 'timestamp': timestamp}])
        })
        print('Updated chat history for user:', message)

# Function to retrieve chat history from Firebase for a specific user
def get_chat_history(user_id):
    user_ref = db.collection('Users').document(user_id)
    user_data = user_ref.get().to_dict()
    if user_data and 'chats' in user_data:
        # Exclude timestamps and handle missing 'sender' field
        chat_history = []
        for message in user_data['chats']:
            chat_message = {'text': message.get('text', ''), 'sender': message.get('sender', 'Unknown')}
            chat_history.append(chat_message)
        return chat_history
    else:
        return []

# Request models
class InputData(BaseModel):
    input_sequence: str
    uid: str

class LinksResponse(BaseModel):
    links: List[dict]

# Routes
@app.get('/')
def start():
    return gemini_model.starting_statement()

@app.post('/get_output')
def get_output(data: InputData):
    response = gemini_model.answers(data.input_sequence)
    # Push user message to Firebase under the user's chats array
    push_chat_message(data.uid, data.input_sequence, 'user')
    push_chat_message(data.uid, response, 'bot')
    # Return response as JSON
    return {'response': response}

@app.post('/history')
async def fetch_chat_history(request: Request):
    data = await request.json()
    user_id = data.get('uid', '')  # Retrieve uid from request data
    # Retrieve chat history from Firebase for the specified user
    history = get_chat_history(user_id)
    # Return chat history as JSON
    return {'response': history}

@app.post('/get_links')
def get_links(data: dict):
    input_sentence = data.get('input_sentence', '')
    # Get links corresponding to words in the input sentence
    result_links = get_links_for_sentence(input_sentence)
    return {'links': result_links}

@app.get("/test")
def test():
    return {"message": "Hello World"}



# To save Videos in Local Store
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
video_dir = os.path.join(BASE_DIR, "temp_videos")


# This route allows us to work 
@app.post("/upload-video-file/")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    
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

VIDEO_DIR = "videos"
if not os.path.exists(VIDEO_DIR):
    os.makedirs(VIDEO_DIR)

# Global storage for PeerConnection instances
pcs = set()

@app.get('/processed_labels')
def save_and_process_video():
    # Dummy processing - Replace with your actual function call
    action_model = os.path.join(BASE_DIR, "intel", "asl-recognition-0004", "FP16", "asl-recognition-0004.xml")
    detection_model = os.path.join(BASE_DIR, "intel", "person-detection-asl-0001", "FP16", "person-detection-asl-0001.xml")
    class_map_path = os.path.join(BASE_DIR, "intel", "msasl100.json")
    device = "CPU"  
    
    fullPath = os.path.join(BASE_DIR, "videos")

    if not os.path.exists(fullPath):
        return HTTPException(status_code=404)

    if os.path.exists(fullPath) and os.path.isdir(fullPath):
        print(os.listdir(fullPath))
        video_path = os.listdir(fullPath).pop(0)
        video_path=os.path.join(fullPath, video_path)
    
        labels = run_gesture_recognition(action_model,
            detection_model,
            video_path,
            class_map_path=class_map_path,
            device=device,
            no_show=True)
        
        print(labels)
        os.remove(video_path)
        return {"labels":labels}
    else:
        return{"labels": ["Nothing to See Here"]}