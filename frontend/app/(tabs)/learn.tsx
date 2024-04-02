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
    ImageBackground,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/context/AuthProvider";
import VideoPlayerModal from "@/components/VideoPlayerModal";

export default function Translation() {
    const { user, signIn, signOut } = useAuth();
    const [message, setMessage] = useState("");
    const [videoUrls, setVideoUrls] = useState<
        { word: string; link: string }[]
    >([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [chats, setChats] = useState<any[]>([]);
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
    const [selectedLesseon, setSelectedLesseon] = useState<string>("");
    // Ref for the ScrollView component
    const scrollViewRef = useRef<ScrollView>(null);

    // Function to scroll to the bottom of the chat view

    const openModalWithVideos = (videos: { word: string; link: string }[]) => {
        setVideoUrls(videos);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const familyWords = [
        {
            Name: "sister",
            LINKS: "https://drive.google.com/uc?export=download&id=13JS0KdnbMem-RVvU30qHcOwNTKC_sEsh",
            IMAGE_URL: require("../../assets/images/sister.png"),
        },
        {
            Name: "brother",
            LINKS: "https://drive.google.com/uc?export=download&id=1xtG2Qdp60dsCUM4Q0xtuFymPGVgtTekg",
            IMAGE_URL: require("../../assets/images/brother.png"),
        },
        {
            Name: "grandmother",
            LINKS: "https://drive.google.com/uc?export=download&id=1gYP0qIbuIqwdC2NdIQyDRNKkNrF7SjEB",
            IMAGE_URL: require("../../assets/images/grandmother.png"),
        },
        {
            Name: "grandfather",
            LINKS: "https://drive.google.com/uc?export=download&id=1TkugtwhhG5-37ucGOpLRtxapPBar19ue",
            IMAGE_URL: require("../../assets/images/grandfather.png"),
        },
        {
            Name: "mother",
            LINKS: "https://drive.google.com/uc?export=download&id=12KA3YroFMzq_FUIWSd7w0wQWUXXVd-jv",
            IMAGE_URL: require("../../assets/images/mother.png"),
        },
        {
            Name: "father",
            LINKS: "https://drive.google.com/uc?export=download&id=1CJGk3J0kkHva12aJYXOEI51qXC7cvRtV",
            IMAGE_URL: require("../../assets/images/father.png"),
        },
    ];

    const commonWords = [
        {
            Name: "no",
            LINKS: "https://drive.google.com/uc?export=download&id=1qPWLyUU9PJwleHRJpKxiQIjd4aUqhlve",
            IMAGE_URL: require("../../assets/images/no.png"),
        },
        {
            Name: "yes",
            LINKS: "https://drive.google.com/uc?export=download&id=1idJfDDHmEKf5c3UoRWvbmnEeBNe0NTL6",
            IMAGE_URL: require("../../assets/images/yes.png"),
        },
        {
            Name: "help",
            LINKS: "https://drive.google.com/uc?export=download&id=16Nb0ok5750hts-GP7RVD2THq-YpoO__O",
            IMAGE_URL: require("../../assets/images/help.png"),
        },
        {
            Name: "thank you",
            LINKS: "https://drive.google.com/uc?export=download&id=1hTpavAnItc1ye0J9pQmr5TLKVQ2wTNgl",
            IMAGE_URL: require("../../assets/images/thanks.png"),
        },
        {
            Name: "please",
            LINKS: "https://drive.google.com/uc?export=download&id=1YBcXu45Dg1cU5g2ejEJiJf3O1vwOpe6F",
            IMAGE_URL: require("../../assets/images/please.png"),
        },
    ];

    const questionWords = [
        {
            Name: "what",
            LINKS: "https://drive.google.com/uc?export=download&id=1v6Iwwr1Q54PHVbVUSgsnnTL8l1l8xIu3",
            IMAGE_URL: require("../../assets/images/what.png"),
        },
        {
            Name: "how",
            LINKS: "https://drive.google.com/uc?export=download&id=120sfqTPUgBxPYs-UYDTPc7HTmg1UsIJi",
            IMAGE_URL: require("../../assets/images/how.png"),
        },
        {
            Name: "who",
            LINKS: "https://drive.google.com/uc?export=download&id=10sxDN1F0GHT5kSBFrJlCq1vXJ20lzd0v",
            IMAGE_URL: require("../../assets/images/who.png"),
        },
        {
            Name: "where",
            LINKS: "https://drive.google.com/uc?export=download&id=1mitdu0ZknNauxuA5UJKXPTk2TVBr6Q4I",
            IMAGE_URL: require("../../assets/images/where.png"),
        },
        {
            Name: "when",
            LINKS: "https://drive.google.com/uc?export=download&id=1zUYsKc11ptB5XnrUvMZIzqUHM_rMa5MY",
            IMAGE_URL: require("../../assets/images/when.png"),
        },
    ];

    return (
        <View className="flex flex-1 bg-[#E3F4FE]">
            <View className="overflow-hidden ">
                {/* <ImageBackground
                    source={require("@/assets/images/sign-bg.jpg")}
                    className="flex flex-col justify-end w-full h-48 shadow-md "
                >
                    <Text className="px-4 py-2 text-sm font-light text-center text-slate-800">
                        Breaking Barriers, One Sign at a Time
                    </Text>
                </ImageBackground> */}
                <View className="bg-[#E3F4FE] flex flex-col items-center justify-center h-28">
                    <Text className="text-4xl text-[#1C0B01]  ">
                        Learn how to Sign!
                    </Text>
                    <Text className="text-xl text-[#1C0B01] mt-2">
                        with our Transformative lessons
                    </Text>
                </View>
            </View>
            <View className="flex-1 p-4 rounded-t-[36px] bg-slate-200 dark:bg-slate-900 justify-center mt-2 flex flex-col items-center">
                {selectedLesseon === "" && (
                    <View className="flex flex-col items-center w-11/12 bg-transparent">
                        <Pressable
                            className="w-full mt-2 bg-[#F8F7F2] flex justify-center rounded-xl flex-row"
                            onPress={() => setSelectedLesseon("family")}
                        >
                            <Image
                                source={require("@/assets/images/family.png")}
                                className="object-cover w-48 rounded-2xl h-28"
                            />
                        </Pressable>
                        <Pressable
                            className="w-full mt-8 bg-[#F8F7F2] flex justify-center rounded-xl flex-row"
                            onPress={() => setSelectedLesseon("common words")}
                        >
                            <Image
                                source={require("@/assets/images/common_words.png")}
                                className="object-cover w-48 rounded-2xl h-28"
                            />
                        </Pressable>
                        <Pressable
                            className="w-full mt-8 bg-[#F8F7F2] flex justify-center rounded-xl flex-row"
                            onPress={() => setSelectedLesseon("question")}
                        >
                            <Image
                                source={require("@/assets/images/question.png")}
                                className="object-cover w-48 rounded-2xl h-28"
                            />
                        </Pressable>
                    </View>
                )}
                {selectedLesseon === "family" && (
                    <View className="flex flex-col bg-transparent">
                        <View className="flex flex-row items-center justify-start w-full bg-transparent">
                            <Pressable>
                                <FontAwesome
                                    name="arrow-left"
                                    className=""
                                    size={20}
                                    onPress={() => setSelectedLesseon("")}
                                />
                            </Pressable>
                            <Text className="w-4/5 ml-4 text-2xl">
                                Family Words
                            </Text>
                        </View>
                        <ScrollView>
                            {familyWords.map((word, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() =>
                                        openModalWithVideos([
                                            {
                                                word: word.Name,
                                                link: word.LINKS,
                                            },
                                        ])
                                    }
                                    className="flex flex-row items-center justify-start p-1 mt-5 bg-slate-50 dark:bg-slate-600 rounded-xl "
                                >
                                    {/* Image */}
                                    <Image
                                        source={word.IMAGE_URL}
                                        // style={{ width: 150, height: 150 }}
                                        className="w-32 h-16 rounded-lg"
                                    />
                                    {/* Text */}
                                    <View className="flex flex-col items-center flex-grow bg-transparent">
                                        <Text className="mt-2 ml-2 text-center">
                                            Learn how to say {word.Name}
                                        </Text>
                                        <Text>in ASL</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )}
                {selectedLesseon === "common words" && (
                    <View className="flex flex-col bg-transparent">
                        <View className="flex flex-row items-center justify-start w-full bg-transparent">
                            <Pressable>
                                <FontAwesome
                                    name="arrow-left"
                                    className=""
                                    size={20}
                                    onPress={() => setSelectedLesseon("")}
                                />
                            </Pressable>
                            <Text className="w-4/5 ml-4 text-2xl">
                                Common Words
                            </Text>
                        </View>
                        <ScrollView>
                            {commonWords.map((word, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() =>
                                        openModalWithVideos([
                                            {
                                                word: word.Name,
                                                link: word.LINKS,
                                            },
                                        ])
                                    }
                                    className="flex flex-row items-center justify-start p-1 mt-5 bg-slate-50 dark:bg-slate-600 rounded-xl "
                                >
                                    {/* Image */}
                                    <Image
                                        source={word.IMAGE_URL}
                                        // style={{ width: 150, height: 150 }}
                                        className="w-32 h-16 rounded-lg"
                                    />
                                    {/* Text */}
                                    <View className="flex flex-col items-center flex-grow bg-transparent">
                                        <Text className="mt-2 ml-2 text-center">
                                            Learn how to say {word.Name}
                                        </Text>
                                        <Text>in ASL</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )}
                {selectedLesseon === "question" && (
                    <View className="flex flex-col bg-transparent">
                        <View className="flex flex-row items-center justify-start w-full bg-transparent">
                            <Pressable>
                                <FontAwesome
                                    name="arrow-left"
                                    className=""
                                    size={20}
                                    onPress={() => setSelectedLesseon("")}
                                />
                            </Pressable>
                            <Text className="w-4/5 ml-4 text-2xl">
                                Question Words
                            </Text>
                        </View>
                        <ScrollView>
                            {questionWords.map((word, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() =>
                                        openModalWithVideos([
                                            {
                                                word: word.Name,
                                                link: word.LINKS,
                                            },
                                        ])
                                    }
                                    className="flex flex-row items-center justify-start p-1 mt-5 bg-slate-50 dark:bg-slate-600 rounded-xl "
                                >
                                    {/* Image */}
                                    <Image
                                        source={word.IMAGE_URL}
                                        // style={{ width: 150, height: 150 }}
                                        className="w-32 h-16 rounded-lg"
                                    />
                                    {/* Text */}
                                    <View className="flex flex-col items-center flex-grow bg-transparent">
                                        <Text className="mt-2 ml-2 text-center">
                                            Learn how to say {word.Name}
                                        </Text>
                                        <Text>in ASL</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
            <VideoPlayerModal
                visible={isModalVisible}
                onClose={closeModal}
                videos={videoUrls}
            />
        </View>
    );
}
