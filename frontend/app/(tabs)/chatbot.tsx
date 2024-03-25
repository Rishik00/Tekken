import React, { useState } from "react";
import { Button, Pressable, ScrollView, TextInput } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/context/AuthProvider";

export default function ChatScreen() {
    const { user, signIn, signOut } = useAuth();
    const [message, setMessage] = useState("");
    interface Chat {
        text: string;
        sender: "user" | "bot";
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
                setChats((prevChats) => [
                    ...prevChats,
                    { text: "Example reply from backend", sender: "bot" },
                ]);
            }, 1000);
        }
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
        </View>
    );
}
