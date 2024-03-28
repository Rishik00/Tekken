import requests

api_url = "put link here"
response = requests.post(api_url, json={"input_sequence": "What is ASL"})
print(response.json())
