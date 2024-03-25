import { Button, Pressable, StyleSheet, TextInput } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { Text, View } from "@/components/Themed";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthProvider";

export default function LoginScreen() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { user, signIn, signOut } = useAuth();

    useEffect(() => {
        if (user) {
            router.replace("/(tabs)");
        }
    }, [user]);

    const handleLogin = () => {
        try {
            signIn(email, password); // Call signIn function from useAuth hook
        } catch (error) {
            alert(error);
        }
    };
    return (
        <View className="items-center justify-center flex-1 bg-slate-100 dark:bg-slate-800">
            <Text className="mb-4 text-2xl">Login</Text>
            <TextInput
                className="w-4/5 p-4 mb-4 bg-white border rounded-md"
                placeholder="Email"
                keyboardType="email-address"
                onChangeText={(text) => setEmail(text)}
            />
            <TextInput
                className="w-4/5 p-4 mb-4 bg-white border rounded-md"
                placeholder="Password"
                secureTextEntry
                onChangeText={(text) => setPassword(text)}
            />
            <Pressable
                onPress={handleLogin}
                className="w-2/5 p-4 bg-blue-500 rounded-md "
            >
                <Text className="text-center text-white">Login</Text>
            </Pressable>
        </View>
    );
}
