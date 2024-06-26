import React, { useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { getAuth, signOut } from "firebase/auth";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>["name"];
    color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [isLoading, setIsLoading] = useState(true);

    getAuth().onAuthStateChanged((user) => {
        setIsLoading(false);
        if (!user) {
            router.replace("/landing");
        }
    });

    if (isLoading) return <Text style={{ paddingTop: 30 }}>Loading...</Text>;

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                // Disable the static render of the header on web
                // to prevent a hydration error in React Navigation v6.
                headerShown: useClientOnlyValue(false, true),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Translation",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="code" color={color} />
                    ),

                    headerLeft: () => (
                        <Link href="/landing">
                            <View className="pl-2">
                                <FontAwesome
                                    name="home"
                                    className=""
                                    size={25}
                                    color="#3B82F6"
                                />
                            </View>
                        </Link>
                    ),
                    headerRight: () => (
                        <Pressable
                            onPress={() => signOut(getAuth())}
                            className="px-3 py-2 mr-2 bg-blue-500 rounded-md "
                        >
                            <Text className="text-center text-white">
                                Sign Out
                            </Text>
                        </Pressable>
                    ),
                }}
            />

            <Tabs.Screen
                name="upload"
                options={{
                    title: "Upload",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="upload" color={color} />
                    ),
                    headerLeft: () => (
                        <Link href="/landing">
                            <View className="pl-2">
                                <FontAwesome
                                    name="home"
                                    className=""
                                    size={25}
                                    color="#3B82F6"
                                />
                            </View>
                        </Link>
                    ),

                    headerRight: () => (
                        <Pressable
                            onPress={() => signOut(getAuth())}
                            className="px-3 py-2 mr-2 bg-blue-500 rounded-md "
                        >
                            <Text className="text-center text-white">
                                Sign Out
                            </Text>
                        </Pressable>
                    ),
                }}
            />

            <Tabs.Screen
                name="learn"
                options={{
                    title: "Learn",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="lightbulb-o" color={color} />
                    ),
                    headerLeft: () => (
                        <Link href="/landing">
                            <View className="pl-2">
                                <FontAwesome
                                    name="home"
                                    className=""
                                    size={25}
                                    color="#3B82F6"
                                />
                            </View>
                        </Link>
                    ),

                    headerRight: () => (
                        <Pressable
                            onPress={() => signOut(getAuth())}
                            className="px-3 py-2 mr-2 bg-blue-500 rounded-md "
                        >
                            <Text className="text-center text-white">
                                Sign Out
                            </Text>
                        </Pressable>
                    ),
                }}
            />

            <Tabs.Screen
                name="chatbot"
                options={{
                    title: "Chat Bot",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="laptop" color={color} />
                    ),

                    headerLeft: () => (
                        <Link href="/landing">
                            <View className="pl-2">
                                <FontAwesome
                                    name="home"
                                    className=""
                                    size={25}
                                    color="#3B82F6"
                                />
                            </View>
                        </Link>
                    ),

                    headerRight: () => (
                        <Pressable
                            onPress={() => signOut(getAuth())}
                            className="px-3 py-2 mr-2 bg-blue-500 rounded-md "
                        >
                            <Text className="text-center text-white">
                                Sign Out
                            </Text>
                        </Pressable>
                    ),
                }}
            />

            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="search" color={color} />
                    ),

                    headerLeft: () => (
                        <Link href="/landing">
                            <View className="pl-2">
                                <FontAwesome
                                    name="home"
                                    className=""
                                    size={25}
                                    color="#3B82F6"
                                />
                            </View>
                        </Link>
                    ),

                    headerRight: () => (
                        <Pressable
                            onPress={() => signOut(getAuth())}
                            className="px-3 py-2 mr-2 bg-blue-500 rounded-md "
                        >
                            <Text className="text-center text-white">
                                Sign Out
                            </Text>
                        </Pressable>
                    ),
                }}
            />
        </Tabs>
    );
}
