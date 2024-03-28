from fastapi import FastAPI, Request, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import os
from NeuralChat7B import NeuralNet7B
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
# Initialize NeuralNet
nn = NeuralNet7B()

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

with open('family_links.json', 'r') as family_file:
    family_links_data = json.load(family_file)

with open('common_links.json', 'r') as common_file:
    common_links_data = json.load(common_file)

with open('question_links.json', 'r') as question_file:
    question_links_data = json.load(question_file)

# Create a dictionary to store gloss-link mappings
gloss_link_mapping = {item['gloss']: item['link'] for item in data}

# Function to get links corresponding to words in a sentence
def get_links_for_sentence(sentence):
    """
    This function takes a sentence as input and returns a list of dictionaries containing words and their corresponding links from the gloss_link_mapping.
    """

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
    """
    Pushes a chat message to the Firestore database for a given user.

    Parameters:
        user_id (str): The ID of the user.
        message (str): The text of the chat message.
        sender (str): The sender of the chat message.

    Returns:
        None

    Raises:
        None
    """

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
    """
    Retrieves the chat history for a given user from the database.

    Parameters:
        user_id (str): The unique identifier of the user.

    Returns:
        list: A list of dictionaries representing the chat history. Each dictionary contains the 'text' and 'sender' fields of a chat message. If the user does not have a chat history or the 'chats' field is missing in the user data, an empty list is returned.
    """
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

# Gemini's output route
@app.post('/get_gemini_output')
def get_output(data: InputData):
    response = gemini_model.answers(data.input_sequence)
    # Push user message to Firebase under the user's chats array
    push_chat_message(data.uid, data.input_sequence, 'user')
    push_chat_message(data.uid, response, 'bot')
    # Return response as JSON
    return {'response': response}

# Intel's Neural Chat 7B output route
@app.post('/get_intel_output')
def get_intel_output(data: InputData):
    response = nn.predict(data.input_sequence)
    # Push user message to Firebase under the user's chats array
    # push_chat_message(data.uid, data.input_sequence, 'user')
    # push_chat_message(data.uid, response, 'neural_bot')
    
    # Return response as JSON
    return {'response': response}


# History route
@app.post('/history')
async def fetch_chat_history(request: Request):
    data = await request.json()
    user_id = data.get('uid', '')  # Retrieve uid from request data
    # Retrieve chat history from Firebase for the specified user
    history = get_chat_history(user_id)
    # Return chat history as JSON
    return {'response': history}


# Get links route
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
    """
    Uploads a video file and performs gesture recognition on it.

    Parameters:
        - background_tasks (BackgroundTasks): A background tasks object.
        - file (UploadFile): The video file to be uploaded.

    Returns:
        - JSONResponse: A JSON response containing the message, labels, upload time, and processing time.

    Raises:
        - None

    Notes:
        - The video file is saved in the `video_dir` directory.
        - The gesture recognition models are located in the `BASE_DIR` directory.
        - The class map file is located in the `BASE_DIR` directory.
        - The video processing is performed using the CPU device.
        - The video directory is deleted after processing.
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

    translated_text = " ".join(labels)

    processing_time = perf_counter() - processing_start_time
    print(f"Video processing time: {processing_time:.2f} seconds")

    if os.path.exists(video_dir):
        shutil.rmtree(video_dir)

    return JSONResponse(content={"message": "Video received and processing started.", "labels": translated_text, "upload-time":upload_time, "performance_time": processing_time}, status_code=200)

@app.post("/assess-sign-language/")
async def assess_sign_language(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    A description of the entire function, its parameters, and its return types.
    """
    # Define the expected word for assessment
    expected_word = "father"
    
    # Create a temporary directory to save the uploaded video
    temp_video_dir = "temp_uploaded_videos"
    os.makedirs(temp_video_dir, exist_ok=True)
    video_path = os.path.join(temp_video_dir, file.filename)

    # Save the uploaded video file
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run gesture recognition on the uploaded video
    labels = run_gesture_recognition(
        action_model,
        detection_model,
        video_path,
        class_map_path=class_map_path,
        device=device,
        no_show=True
    )

    # Check if the expected word is found in the recognized labels
    if expected_word in labels:
        result = "You've passed!"
    else:
        result = "Sorry, you did not sign the correct word."

    # Delete the temporary video directory
    if os.path.exists(temp_video_dir):
        shutil.rmtree(temp_video_dir)

    return JSONResponse(content={"message": result}, status_code=200)

# Endpoint to serve family course JSON content
# @app.get("/family_course")
# def get_family_course():
#     return family_links_data

# # Endpoint to serve common course JSON content
# @app.get("/common_course")
# def get_common_course():
#     return common_links_data

# # Endpoint to serve question course JSON content
# @app.get("/question_course")
# def get_question_course():
#     return question_links_data