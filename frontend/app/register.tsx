import { Button, Pressable, StyleSheet, TextInput } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

import { Text, View } from "@/components/Themed";
import { useState } from "react";
import { router } from "expo-router";

export default function RegisterScreen() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleRegister = () => {
        createUserWithEmailAndPassword(getAuth(), email, password)
            .then((user) => {
                if (user) router.replace("/(tabs)");
            })
            .catch((err) => {
                alert(err?.message);
            });
    };
    return (
        <View className="flex-1 items-center justify-center bg-slate-100 dark:bg-slate-800">
            <Text className="text-2xl mb-4">Register</Text>
            <TextInput
                className="bg-white w-4/5 p-4 mb-4 rounded-md border"
                placeholder="Email"
                keyboardType="email-address"
                onChangeText={(text) => setEmail(text)}
            />
            <TextInput
                className="bg-white w-4/5 p-4 mb-4 rounded-md border"
                placeholder="Password"
                secureTextEntry
                onChangeText={(text) => setPassword(text)}
            />
            <Pressable
                onPress={handleRegister}
                className=" bg-blue-500 w-2/5 p-4 rounded-md"
            >
                <Text className="text-white text-center">Register</Text>
            </Pressable>
        </View>
    );
}
