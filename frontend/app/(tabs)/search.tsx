import React, { useState, useEffect, useRef } from "react";
import {
    Button,
    Image,
    Pressable,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    TextInput,
    Keyboard,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import VideoPlayerModal from "@/components/VideoPlayerModal";

export default function SearchScreen() {
    interface Chat {
        text: string;
        sender: "user" | "bot";
        videos?: { word: string; link: string }[]; // Updated type for videos
    }

    const [message, setMessage] = useState("");
    const [videoUrls, setVideoUrls] = useState<
        { word: string; link: string }[]
    >([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

    // Ref for the ScrollView component
    const scrollViewRef = useRef<ScrollView>(null);

    // Function to scroll to the bottom of the chat view
    const scrollToBottom = () => {
        scrollViewRef?.current?.scrollToEnd({ animated: true });
    };

    const handleKeyboardChange = (keyboardVisible: boolean) => {
        if (keyboardVisible) {
            scrollToBottom();
        }
    };

    // Subscribe to keyboard visibility changes
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            "keyboardDidShow",
            () => handleKeyboardChange(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            () => handleKeyboardChange(false)
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Function to handle sending a message
    const sendMessage = async () => {
        if (message.trim() !== "") {
            setChats((prevChats) => [
                ...prevChats,
                { text: message, sender: "user" },
            ]);
            setMessage("");
            scrollToBottom();
            setTimeout(async () => {
                const exampleReply = await fetch(`${API_BASE_URL}/get_links`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        input_sentence: message,
                    }),
                }).then((response) => response.json());
                setChats((prevChats) => [
                    ...prevChats,
                    {
                        text: "Here's your Translation",
                        sender: "bot",
                        videos: exampleReply.links,
                    },
                ]);

                // const exampleReply: Chat = {
                //     text: "Here's your Translation",
                //     sender: "bot",
                //     videos: [
                //         {
                //             word: "divorce",
                //             link: "https://drive.google.com/uc?export=download&id=13V8oczW3TKJZwylBeSWFNtozTKsFup1B",
                //         },
                //         {
                //             word: "disappear",
                //             link: "https://drive.google.com/uc?export=download&id=1Ca3Wdp2uDSrZ9WSP0mEUBwUGSeVOIAMw",
                //         },
                //     ],
                // };
                // setChats((prevChats) => [...prevChats, exampleReply]);
                scrollToBottom();
            }, 1000);
        }
    };

    const openModalWithVideos = (videos: { word: string; link: string }[]) => {
        setVideoUrls(videos);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust this value according to your needs
        >
            <View className="flex-1 p-4 bg-slate-200 dark:bg-slate-900">
                <ScrollView
                    ref={scrollViewRef} // Assign the ref to ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "flex-end",
                    }}
                >
                    {chats.map((chat, index) => (
                        <View
                            key={index}
                            className={`p-2 my-2 ${
                                chat.sender === "user"
                                    ? "bg-blue-200 dark:bg-blue-500 self-end"
                                    : "bg-slate-50 dark:bg-slate-500 self-start"
                            } rounded-lg`}
                        >
                            <Text>{chat.text}</Text>
                            {chat.videos !== undefined && (
                                <Pressable
                                    onPress={() =>
                                        openModalWithVideos(
                                            chat.videos as {
                                                word: string;
                                                link: string;
                                            }[]
                                        )
                                    }
                                    className="flex flex-row items-center justify-center p-2 mt-2 rounded-lg bg-slate-200 dark:bg-slate-400"
                                >
                                    <Image
                                        source={require("@/assets/images/video-player.png")}
                                        className="w-16 h-16"
                                    />
                                    <Text className="ml-2 text-center text-blue-500 dark:text-blue-800">
                                        View Videos
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    ))}
                </ScrollView>
                <View className="flex flex-row items-center mt-2 rounded-2xl bg-slate-50 dark:bg-slate-500">
                    <TextInput
                        className="flex-1 px-4 py-1 dark:text-slate-200"
                        value={message}
                        onChangeText={(text) => setMessage(text)}
                        placeholder="Text to sign language translation"
                    />
                    <Pressable
                        className="h-full px-3 py-2 bg-blue-500 rounded-2xl"
                        onPress={sendMessage}
                    >
                        <FontAwesome
                            name="arrow-right"
                            className=""
                            size={20}
                        />
                    </Pressable>
                </View>
                <VideoPlayerModal
                    visible={isModalVisible}
                    onClose={closeModal}
                    videos={videoUrls}
                />
            </View>
        </KeyboardAvoidingView>
    );
}
