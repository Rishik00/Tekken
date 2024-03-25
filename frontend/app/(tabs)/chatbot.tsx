import React, { useState, useEffect } from "react";
import { Button, Image, Pressable, ScrollView, TextInput } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/context/AuthProvider";
import VideoPlayerModal from "@/components/VideoPlayerModal";

export default function ChatScreen() {
    const { user, signIn, signOut } = useAuth();
    const [message, setMessage] = useState("");
    const [videoUrls, setVideoUrls] = useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [chats, setChats] = useState<any[]>([]); // Modified to any[] to accommodate Firebase data structure
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
    // Function to fetch chat history from backend
    // Function to fetch chat history from backend
    const fetchChatHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/history`, {
                method: "POST", // Change to POST method
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uid: user?.uid }), // Include user ID in the request body
            });
            const data = await response.json();
            setChats(data.response);
            console.log("Chat history fetched:", data.response);
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    useEffect(() => {
        fetchChatHistory();
    }, []); // Fetch chat history on component mount

    // Function to handle sending a message
    // Function to handle sending a message
    const sendMessage = async () => {
        // Check if message is not empty
        if (message.trim() !== "") {
            // For demonstration, let's just append the message to chats
            setChats((prevChats) => [
                ...prevChats,
                { text: message, sender: "user" },
            ]);
            // Reset message input
            setMessage("");
            // Simulate reply from backend (for demonstration)
            setTimeout(async () => {
                // Example reply from backend with videos
                const exampleReply = await fetch(`${API_BASE_URL}/get_output`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        input_sequence: message,
                        uid: user?.uid,
                    }), // Include user ID in the request body
                }).then((response) => response.json());
                setChats((prevChats) => [
                    ...prevChats,
                    { text: exampleReply.response, sender: "bot" },
                ]);
            }, 1000);
        }
    };

    const openModalWithVideos = (videos: string[]) => {
        setVideoUrls(videos);
        setIsModalVisible(true);
    };
    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <View className="flex-1 p-4 bg-slate-200 dark:bg-slate-800">
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "flex-end",
                }}
            >
                {/* Render chats */}
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
                                    openModalWithVideos(chat.videos as string[])
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
            {/* Input field for sending messages */}
            <View className="flex flex-row items-center mt-2 rounded-2xl bg-slate-50 dark:bg-slate-500">
                <TextInput
                    className="flex-1 px-4 py-1 dark:text-slate-200"
                    value={message}
                    onChangeText={(text) => setMessage(text)}
                    placeholder="Type your message..."
                />
                <Pressable
                    className="h-full px-3 py-2 bg-blue-500 rounded-2xl"
                    onPress={sendMessage}
                >
                    <FontAwesome name="arrow-right" className="" size={20} />
                </Pressable>
            </View>
            <VideoPlayerModal
                visible={isModalVisible}
                onClose={closeModal}
                videos={videoUrls}
            />
        </View>
    );
}
