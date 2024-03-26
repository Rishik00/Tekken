from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import List
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from gemini import GetGeminiOutput
import json
from dotenv import load_dotenv

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
    if user_data is None:
        # Create the user document if it doesn't exist
        user_ref.set({
            'chats': [{'text': message, 'sender': sender}]
        })
    else:
        # Update the existing user document to add the new chat message
        user_ref.update({

            'chats': firestore.ArrayUnion([{'text': message, 'sender': sender}])
        })
        print('Updated chat history for user:', message)

# Function to retrieve chat history from Firebase for a specific user
def get_chat_history(user_id):
    user_ref = db.collection('Users').document(user_id)
    user_data = user_ref.get().to_dict()
    if user_data and 'chats' in user_data:
        return user_data['chats']
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