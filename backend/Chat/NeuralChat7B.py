# Chat module
from transformers import AutoTokenizer, AutoModelForCausalLM

class NeuralNet7B:
    def __init__(self, max_length: int = 2000):
        """
        Initializes the Chatbot model with a maximum length parameter.

        Args:
            max_length (int, optional): The maximum length of the input sequence. Defaults to 2000.
        """
        self.model_name = 'Intel/neural-chat-7b-v3'
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
        self.system_prompt = "Welcome to our sign language learning assistant! Our app is designed to help you " \
                             "master American Sign Language (ASL) through various features: " \
                             "1. Real-time translation: We provide instant translation to any uploaded video " \
                             "using advanced image recognition technology. " \
                             "2. Interactive learning: Engage with our educational videos and test your " \
                             "knowledge using real-time sign detection. " \
                             "Your mission is to answer any question or query related to ASL. " \
                             "Please feel free to ask, and I'll provide concise explanations and guidance."             
        self.max_length = max_length

    def predict(self, input_sequence):
        """
        Predicts a response given an input sequence by generating text based on the model.
        :param input_sequence: The input text sequence for which a response is generated.
        :return: The generated response based on the input sequence.
        """
        prompt = f"### System:\n{self.system_prompt}\n### User:\n{input_sequence}\n### Assistant:\n"  
        
        tokenized_inputs = self.tokenizer.encode(prompt, return_tensors="pt", add_special_tokens=False)
        outputs = self.model.generate(tokenized_inputs, max_length=self.max_length, num_return_sequences=1)
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return response.split("### Assistant:\n")[-1]
