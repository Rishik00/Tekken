import React, { useState } from "react";
import { Button, Image, Pressable, ScrollView, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Text } from "@/components/Themed";
import { FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import * as Speech from "expo-speech";
const DocPicker = () => {
    const [doc, setDoc] = useState<any>();
    const [filename, setFilename] = useState<string>();
    const [isDocPickPressed, setIsDocPickPressed] = useState(false);
    const [isUploadPressed, setIsUploadPressed] = useState(false);
    const [translatedText, setTranslatedText] = useState<string>("");
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

    const resetDocument = () => {
        setDoc(undefined);
        setFilename(undefined);
        setTranslatedText("");
    };
    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true,
        }).then((response) => {
            if (response.canceled == false && response.assets != null) {
                let { name, size, uri } = response.assets[0];
                let nameParts = name.split(".");
                let fileType = nameParts[nameParts.length - 1];
                var fileToUpload = {
                    name: name,
                    size: size,
                    uri: uri,
                    type: "application/" + fileType,
                };
                setDoc(fileToUpload);
                setFilename(name);
            }
        });
        // console.log(result);
    };
    const speak = () => {
        const thingToSay = translatedText.toString();
        Speech.speak(thingToSay);
    };
    const postDocument = () => {
        const url = `${API_BASE_URL}/upload-video-file/`;
        const formData = new FormData();
        formData.append("file", doc);
        const options = {
            method: "POST",
            body: formData,
            headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        };
        setTranslatedText("loading...");
        // console.log(formData);

        fetch(url, options)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                // console.log(data);
                setTranslatedText(data.labels);
                // Do something with the response data if needed
            })
            .catch((error) => console.error("Error:", error));
    };

    return (
        <View className="flex flex-col items-center flex-1 p-4 bg-slate-200 dark:bg-slate-900">
            <Image
                source={require("@/assets/images/upload.png")}
                className="w-40 h-40 mt-4"
            />
            <Text className="mt-2 text-lg">Upload a video to translate</Text>
            {doc && (
                <View className="flex flex-row items-center justify-end w-4/5 mt-4 rounded-lg shadow-lg bg-slate-50 dark:bg-slate-600">
                    <Text className="w-4/5 ">{filename}</Text>
                    <Pressable className="p-2 border-l" onPress={resetDocument}>
                        <FontAwesome name="trash-o" className="" size={24} />
                    </Pressable>
                </View>
            )}

            {doc ? (
                <Pressable
                    onPress={postDocument}
                    className={`w-full ${
                        isUploadPressed ? "bg-blue-600" : "bg-blue-500"
                    } flex flex-row items-center justify-end w-4/5 mt-4 rounded-lg shadow-lgl`}
                    onPressIn={() => setIsUploadPressed(true)}
                    onPressOut={() => setIsUploadPressed(false)}
                >
                    <Text className="w-4/5 text-center text-white">
                        Upload Video
                    </Text>
                    <View className="p-2 border-l ">
                        <FontAwesome name="upload" className="" size={24} />
                    </View>
                </Pressable>
            ) : (
                <Pressable
                    onPress={pickDocument}
                    className={`w-full ${
                        isDocPickPressed ? "bg-blue-600" : "bg-blue-500"
                    } flex flex-row items-center justify-end w-4/5 mt-4 rounded-lg shadow-lgl`}
                    onPressIn={() => setIsDocPickPressed(true)}
                    onPressOut={() => setIsDocPickPressed(false)}
                >
                    <Text className="w-4/5 text-center text-white">
                        Select Video
                    </Text>
                    <View className="p-2 border-l ">
                        <FontAwesome
                            name="file-video-o"
                            className=""
                            size={24}
                        />
                    </View>
                </Pressable>
            )}

            {translatedText !== "" && (
                <View className="flex flex-col items-center w-full">
                    <View className="flex flex-row items-center w-4/5 mt-6 bg-transparent ">
                        <View className="flex-grow h-[1px] bg-slate-300 dark:bg-slate-600 ml-2"></View>
                        <Text className="mx-2 text-sm tracking-wider text-center">
                            Translated Text
                        </Text>
                        <View className="flex-grow h-[1px]  bg-slate-300 dark:bg-slate-600 mr-2"></View>
                    </View>
                    <View className="flex flex-row justify-between w-4/5 p-2 px-4 mt-4 rounded-lg shadow-lg max-h-72 bg-slate-50 dark:bg-slate-600">
                        <ScrollView>
                            <Text>{translatedText}</Text>
                        </ScrollView>
                        {translatedText !== "loading..." && (
                            <Pressable onPress={speak}>
                                <AntDesign
                                    name="sound"
                                    size={24}
                                    color="#3B82F6"
                                />
                            </Pressable>
                        )}
                    </View>
                </View>
            )}

            {/* <Button title="Select Document" onPress={pickDocument} />
            <Button title="Upload" onPress={postDocument} /> */}
        </View>
    );
};

export default DocPicker;
