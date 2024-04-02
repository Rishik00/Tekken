# Intel's AI Hackathon

# Project Description: 
## Saradhi AI: Sign Language Learning Mobile App 🤟
## Intel's ToolKits used: Intel's OpenVino toolkit, Intel Developer cloud

## Project Demo: https://youtu.be/Rm8zwcfuMgI
## Project Demo: 

Welcome to Saradhi AI, your ultimate companion for learning and mastering sign language made possible through Intel. Saradhi AI combines cutting-edge technology with comprehensive learning resources to make sign language accessible to everyone. With real-time sign language translation, informative courses, a searchable database, and a helpful assistant, Saradhi AI is your one-stop solution for sign language learning.


## Demonstration of the Project

## Installation and configuration steps:
1. clone the repository to your local environment: 
`git clone my-repo-name`
2. install the dependencies:
`pip install requirements.txt`
3. Start the development server using uvicorn: 
`uvicorn app:app --reload`
4. Start the front end after configuring the environment settings
`npm start` 


## Features

 1. Real-time Sign Language Translation 🔄
 2.  Sign Language Translation Through Video Upload.
 3. Informative Course on Learning Sign Language.
 4. Search Engine for Querying Specific Words in ASL 🔎
 5. Chatbot for Clearing Basic Doubts About American Sign language 💬🤖


## Flow Diagram 🔄📊

The flow diagram illustrates the sequential steps and interactions within Saradhi AI, ensuring a smooth and efficient workflow. Let's delve into the key components:
<img width="2037" alt="Saradhi Ai flowchart" src="https://github.com/Rishik00/Tekken/assets/95875573/dce9441e-f161-40ec-92a5-2a08bc8a0225">



### User Interaction 🤳🗣️:

Users interact with Saradhi AI through the mobile app, providing input via text, voice, or video. 
<div style="display: flex;">
    <img src="https://github.com/Rishik00/Tekken/assets/96735720/3fe841b1-c6c9-4522-ac16-f321773fb5f9" alt="Video Upload" width="200" style="margin-right: 10px;"> 
    <img src="https://github.com/Rishik00/Tekken/assets/96735720/7b32679f-d7da-408b-91e0-6f9c9bf19895" alt="Video Upload" width="200" style="margin-right: 10px;">
</div>




### Real-time Sign Language Translation 🔄📝:

Saradhi AI's real-time sign language translation feature instantly converts sign language gestures captured by the device's camera into understandable text, providing seamless communication assistance.

https://github.com/Rishik00/Tekken/assets/96735720/9fed7771-0751-42e3-a5b1-3ae082fba968.mp4

### Sign Language Translation Through Video Upload 🎥🔍:

Users can upload pre-recorded videos of sign language gestures for translation. Saradhi AI analyzes the uploaded videos using Intel's OpenVino ASL Recognition 004 model, providing accurate translations and enhancing accessibility.

<div style="display: flex; justify-content: center;">
    <img src="https://github.com/Rishik00/Tekken/assets/96735720/bd6cf102-8e2f-45a5-a03b-fb63f08d6900" alt="Video Upload" width="200" style="margin-right: 10px;"> 
    <img src="https://github.com/Rishik00/Tekken/assets/96735720/89771063-2c55-4f88-a295-70d41b57a2b7" alt="Video Upload" width="200" style="margin-right: 10px;">
</div>


### Informative Course on Learning Sign Language 📚✍️:

Saradhi AI offers an informative course on learning sign language, featuring interactive lessons and built-in assignments. Users can progress through the course at their own pace, receiving personalized feedback powered by Intel's OpenVino ASL Recognition 004 model.

<div style="display: flex;">
    <img src="https://github.com/Rishik00/Tekken/assets/96735720/aa764236-466e-4ac3-b35b-4f49cca9d3be" alt="Video Upload" width="200" style="margin-right: 10px;"> 
    <img src="https://github.com/Rishik00/Tekken/assets/96735720/fff1258e-bb3d-4a0e-afa7-80dfe9fe570f" alt="Video Upload" width="200" style="margin-right: 10px;">
</div>



### Search Engine for Querying Specific Words in ASL 🔎📝:

The search engine allows users to query specific words or phrases in American Sign Language (ASL). Saradhi AI's database contains a vast collection of ASL gestures, enabling users to easily find and practice sign language vocabulary.

<div style="display: flex;">
    <img src="https://github.com/Rishik00/Tekken/assets/96735720/993af228-f5ad-4d57-b352-e1e114023883" alt="Video Upload" width="200" style="margin-right: 10px;"> 
    <img src="https://github.com/Rishik00/Tekken/assets/96735720/8b5da1bd-ea52-4ad5-918a-b4ab094bbec3" alt="Video Upload" width="200" style="margin-right: 10px;">
</div>

  

### Chatbot for Clearing Basic Doubts About ASL:

Saradhi AI's integrated chatbot provides instant assistance and clears doubts about sign language. Powered by Intel-Hugging Face Neural Chat 7B model, the chatbot offers intelligent responses to user queries, ensuring a smooth learning experience. We have integrated the following three models for our chatbot feature: 
1. **Intel's NeuralChat 7B**
2. **OpenAI's GPT2 (Finetuned)**
3. **Google's Gemini Pro**

<div style="display: flex;">
    <img src="https://github.com/Rishik00/Tekken/assets/96735720/dbca1fee-75af-4761-b95c-3add0e227e13" alt="Video Upload" width="200" style="margin-right: 10px;"> 
    <img src="https://github.com/Rishik00/Tekken/assets/96735720/51f45a54-7fd4-4b4f-add1-cc7921069e33" alt="Video Upload" width="200" style="margin-right: 10px;">
</div>

  

## Technologies Used!


- **Frontend**: Developed using **React Native** for a seamless mobile user interface. React Native is an open-source UI software framework created by Meta Platforms, Inc. It is used to develop applications for Android, Android TV, iOS, macOS, tvOS, Web, Windows and UWP by enabling developers to use the React framework along with native platform capabilities.

- **Backend**: Implemented with **FastAPI** to handle server-side logic efficiently.FastAPI is a modern web framework first released in 2018 for building RESTful APIs in Python. It is used for building APIs with Python 3.8+ based on standard Python-type hints. FastAPI is based on Pydantic and uses type hints to validate, serialize and deserialize data. 

- **Sign Language Recognition**: The models used for Sign Language Recognition are all from Intel **OpenVino**, an open-source software toolkit for optimizing and deploying deep learning models. It enables programmers to develop scalable and efficient AI solutions with relatively few lines of code.  The models supported by the gesture recognition application are:
	1.  **asl-recognition-00040:** 
A human gesture recognition model for the American Sign Language (ASL) recognition scenario (word-level recognition). The model uses an S3D framework with MobileNet V3 backbone. Please refer to the  [MS-ASL-100](https://www.microsoft.com/en-us/research/project/ms-asl/)  dataset specification to see the list of gestures that are recognized by this model.The model accepts a stack of frames sampled with a constant frame rate (15 FPS) and produces a prediction on the input clip.
	
    
	2.  **common-sign-language-0001:**
			A human gesture recognition model for the Jester dataset recognition scenario (gesture-level recognition). The model uses an S3D framework with MobileNet V3 backbone. Please refer to the  [Jester](https://web.archive.org/web/20210722062232/https://20bn.com/datasets/jester/)  dataset specification to see the list of gestures that are recognized by this model. The model accepts a stack of frames (8 frames) sampled with a constant frame rate (15 FPS) and produces a prediction on the input clip.
		
    
	3. **common-sign-language-0002:**
	    A human gesture recognition model for the Common-Sign-Language gesture recognition scenario. The model support 12 common single-hand gestures:

		-   Digits: 0, 1, 2, 3, 4, 5
    
		-  	 Sliding Two Fingers Up / Down / Left / Right
    
		-   Thumb Up / Down
    
		The model uses an S3D framework with MobileNet V3 backbone and accepts a stack of frames (8 frames) sampled with a constant frame rate (15 FPS) and produces a prediction on the input clip.
    
	4.  **person-detection-asl-0001**:
This is a person detector for the ASL Recognition scenario. It is based on ShuffleNetV2-like backbone that includes depth-wise convolutions to reduce the amount of computation for the 3x3 convolution block and FCOS head.

- **Chatbot**: The two chatbots that are available and ready for use are **Gemini-pro from Google** and **NeuralChat 7B from Intel**. Apart from this many other chatbots have been tested such as Mistral, Zephyr, bert-large (**from intel's extension for transformers library**) and GPT-2. The chatbots hyper parameters have been tuned to be able to handle quries of different lengths related to sign language and can direct users to different sections of our app based on their queries.
- Along with this, we have finetuned OpenAI's **GPT2** using a custom dataset of 100 question-answer pairs. Kindly checkout our `finetune.py` notebook in the backend directory for more details.
  

## About Us
#### Team Name: Tekken
Saradhi AI is developed by a team passionate about making sign language accessible to everyone. We believe in leveraging technology to bridge communication gaps and empower individuals with valuable skills. Through the language of hands, we bridge divides and empower voices, ensuring inclusivity for all abilities.

Let's embark on a journey of learning and inclusion together with Saradhi AI!
