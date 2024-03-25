from flask import Flask, request, jsonify
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from gemini import GetGeminiOutput

# Initialize Flask app
app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("./firebase-admin.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Initialize Gemini model
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
gemini_model = GetGeminiOutput(API_KEY=GOOGLE_API_KEY, max_tokens=3000, temperature=0.7)

# Function to push a chat message to Firebase under the user's chats array
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


# Function to retrieve chat history from Firebase for a specific user
def get_chat_history(user_id):
    user_ref = db.collection('Users').document(user_id)
    user_data = user_ref.get().to_dict()
    if user_data and 'chats' in user_data:
        return user_data['chats']
    else:
        return []

# Routes
@app.route('/')
def start():
    return gemini_model.starting_statement()

@app.route('/get_output', methods=['POST'])
def get_output():
    input_sequence = request.json.get('input_sequence', '')
    user_id = request.json.get('uid', '')  # Assuming user_id is sent from frontend
    response = gemini_model.answers(input_sequence)
    # Push user message to Firebase under the user's chats array
    push_chat_message(user_id, input_sequence, 'user')
    push_chat_message(user_id, response, 'bot')
    # Return response as JSON
    return jsonify({'response': response})

@app.route('/history', methods=['POST'])  # Specify POST method
def fetch_chat_history():
    request_data = request.get_json()  # Get JSON data from request body
    user_id = request_data.get('uid', '')  # Retrieve uid from request data
    # Retrieve chat history from Firebase for the specified user
    history = get_chat_history(user_id)
    # Return chat history as JSON
    return jsonify({'response': history})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
