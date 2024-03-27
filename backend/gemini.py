import json
from IPython.display import Markdown, display
import google.generativeai as genai

class GetGeminiOutput:
    def __init__(self, API_KEY: str, max_tokens: int = 3000, temperature: int = 0.7) -> None:
        """
        Initializes an instance of the class with the given API key, maximum number of tokens, and temperature.

        Parameters:
            API_KEY (str): The API key for accessing the generative model.
            max_tokens (int, optional): The maximum number of tokens in the generated output. Defaults to 3000.
            temperature (float, optional): The temperature parameter for controlling the randomness of the generated output. Defaults to 0.7.

        Returns:
            None
        """
        self.max_tokens = max_tokens
        self.model = genai.GenerativeModel('gemini-pro')
        self.temperature = temperature
        self.API_KEY = API_KEY
        self.generate_config = genai.types.GenerationConfig(
            max_output_tokens=max_tokens
        )
        self.genai_config = genai.configure(api_key=API_KEY)
        self.chat = self.model.start_chat(history=[])
    
    def starting_statement(self):
        """
        Generates the starting statement for the assistant.

        Returns:
            str: The opening statement for the assistant.
        """
        self.open = self.model.generate_content(
            'Introduce yourself as sally, an assistant always at to the users aid \
            with questions and offer to help.', generation_config=self.generate_config
        ).text
        return self.open
        
    def answers(self, input_sequence) -> str:
        self.chat.send_message(input_sequence)
        response = self.model.generate_content(input_sequence, generation_config=self.generate_config)
        return response.text

    
    def get_chat_history(self):
        return self.chat.history     

    def make_markdown(self):
        return Markdown(self.chat.make_markdown())
        # display(Markdown(self.chat.make_markdown()))
        return self.chat.make_markdown()

