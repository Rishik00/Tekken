import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel

class FineTunedGPT2:
    def __init__(self, model_path = "model.pth"):
        self.model = GPT2LMHeadModel.from_pretrained('gpt2')
        self.tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
        self.state_dict = torch.load(model_path, map_location=torch.device('cpu'))
        self.model.load_state_dict(self.state_dict)
        self.model.eval()

    def generate_text(self, input_sequence):
        input_ids = self.tokenizer.encode(input_sequence, return_tensors="pt")
        output = self.model.generate(input_ids, max_length=40, num_return_sequences=1, temperature=0.35, do_sample=True)
        generated_text = self.tokenizer.decode(output[0], skip_special_tokens=True)
        return generated_text
