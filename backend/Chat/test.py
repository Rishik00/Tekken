import requests
# This is for testing the API's for those of you who don't have postman 
def test():
    """
    A function that sends a POST request to the specified API URL with a JSON payload containing the input sequence "What is ASL". Prints the JSON response.
    """
    api_url = "put link here"
    response = requests.post(api_url, json={"input_sequence": "What is ASL"})
    print(response.json())
