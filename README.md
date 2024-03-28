
# Saradhi AI: Sign Language Learning Mobile App 🤟

Welcome to Saradhi AI, your ultimate companion for learning and mastering sign language made possible through Intel. Saradhi AI combines cutting-edge technology with comprehensive learning resources to make sign language accessible to everyone. With real-time sign language translation, informative courses, a searchable database, and a helpful chatbot, Saradhi AI is your one-stop solution for sign language learning.


## Demonstration of the Project

  
  

## Features

  

 1. Real-time Sign Language Translation 🔄
 2.  Sign Language Translation Through Video Upload 🎥
 3. Informative Course on Learning Sign Language 📚✍️
 4. Search Engine for Querying Specific Words in ASL 🔎📝
 5. Chatbot for Clearing Basic Doubts About ASL 💬🤖
  



  
  

## Flow Diagram 🔄📊

The flow diagram illustrates the sequential steps and interactions within Saradhi AI, ensuring a smooth and efficient workflow. Let's delve into the key components:

  

### User Interaction 🤳🗣️:

Users interact with Saradhi AI through the mobile app, providing input via text, voice, or video.

  

### Real-time Sign Language Translation 🔄📝:

Saradhi AI's real-time sign language translation feature instantly converts sign language gestures captured by the device's camera into understandable text, providing seamless communication assistance.

  

### Sign Language Translation Through Video Upload 🎥🔍:

Users can upload pre-recorded videos of sign language gestures for translation. Saradhi AI analyzes the uploaded videos using Intel's OpenVino ASL Recognition 004 model, providing accurate translations and enhancing accessibility.

### Informative Course on Learning Sign Language 📚✍️:

Saradhi AI offers an informative course on learning sign language, featuring interactive lessons and built-in assignments. Users can progress through the course at their own pace, receiving personalized feedback powered by Intel's OpenVino ASL Recognition 004 model.

### Search Engine for Querying Specific Words in ASL 🔎📝:

The search engine allows users to query specific words or phrases in American Sign Language (ASL). Saradhi AI's database contains a vast collection of ASL gestures, enabling users to easily find and practice sign language vocabulary.

  

### Chatbot for Clearing Basic Doubts About ASL 💬🤖:

Saradhi AI's integrated chatbot provides instant assistance and clears doubts about sign language. Powered by Intel-Hugging Face Neural Chat 7B model, the chatbot offers intelligent responses to user queries, ensuring a smooth learning experience.

  

## Technologies Used

  

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

- **Chatbot**: Intel-Hugging Face Neural Chat 7B model provides intelligent responses to user queries.

  

## About Us

  

Saradhi AI is developed by a team passionate about making sign language accessible to everyone. We believe in leveraging technology to bridge communication gaps and empower individuals with valuable skills. Through the language of hands, we bridge divides and empower voices, ensuring inclusivity for all abilities.🌟🤝

  
  

Let's embark on a journey of learning and inclusion together with Saradhi AI! 🌈🤟