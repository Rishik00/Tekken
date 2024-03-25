import React, { useState } from "react";
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
    interface Chat {
        text: string;
        sender: "user" | "bot";
        videos?: string[];
    }

    const [chats, setChats] = useState<Chat[]>([]);

    // Function to handle sending a message
    const sendMessage = () => {
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
            setTimeout(() => {
                // Example reply from backend with videos
                const exampleReply: Chat = {
                    text: "Example reply from backend",
                    sender: "bot",
                    videos: [
                        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    ],
                };
                setChats((prevChats) => [...prevChats, exampleReply]);
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
