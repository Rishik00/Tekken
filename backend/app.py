from flask import Flask, request, jsonify
from gemini import GetGeminiOutput
import os

app = Flask(__name__)
GOOGLE_API_KEY=os.getenv('GOOGLE_API_KEY')
gemini_model = GetGeminiOutput(API_KEY=GOOGLE_API_KEY, max_tokens=3000, temperature=0.7)

@app.route('/')
def start():
    return gemini_model.starting_statement()

@app.route('/get_output', methods=['POST'])
def get_output():
    input_sequence = request.json.get('input_sequence', '')
    response = gemini_model.answers( input_sequence )
    # Return response as JSON
    return jsonify({'response': response})

@app.route('/history')
def get_chat_history():
    # Get chat history from gemini_model
    history = gemini_model.get_chat_history()

    # Convert history to a JSON-serializable format
    serialized_history = []
    for item in history:
        # Iterate over parts of the message
        message_text = ""
        for part in item.parts:
            # Append text from each part to the message_text variable
            message_text += part.text + "\n"
        
        # Append the combined message text to the serialized history
        serialized_history.append({'text': message_text, 'role': item.role})

    # Return serialized history as JSON
    return jsonify({'response': serialized_history})

if __name__ == '__main__':
    app.run(debug=True)