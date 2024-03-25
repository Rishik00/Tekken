import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, View, Text } from "react-native";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";

interface VideoPlayerModalProps {
    visible: boolean;
    onClose: () => void;
    videos: { gloss: string; link: string }[]; // Updated type for videos
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
    visible,
    onClose,
    videos,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef<Video>(null);

    useEffect(() => {
        setCurrentIndex(0); // Reset current index when modal is opened
        setIsPlaying(true); // Ensure the video starts playing automatically
    }, [visible]);

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
            // Play the next video automatically when the current one finishes
            if (currentIndex < videos.length - 1) {
                setCurrentIndex((prevIndex) => prevIndex + 1);
                setIsPlaying(true); // Ensure the next video starts playing automatically
            } else {
                // onClose();
            }
        }
    };

    const handleNextVideo = () => {
        if (currentIndex < videos.length - 1) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
            setIsPlaying(true); // Ensure the next video starts playing automatically
        }
    };

    const handlePrevVideo = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prevIndex) => prevIndex - 1);
            setIsPlaying(true); // Ensure the previous video starts playing automatically
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex flex-col items-center justify-center h-full bg-[#00000090]">
                <View className="w-11/12 p-4 rounded-lg bg-slate-200 dark:bg-slate-800">
                    <View className="flex flex-row items-center w-full bg-transparent ">
                        <View className="flex-grow h-[1px] bg-slate-300 dark:bg-slate-600 ml-2"></View>
                        <Text className="mx-2 text-sm tracking-wider text-center dark:text-slate-200">
                            Videos
                        </Text>
                        <View className="flex-grow h-[1px] bg-slate-300 dark:bg-slate-600 mr-2"></View>
                    </View>
                    {videos.length > 0 && currentIndex < videos.length ? ( // Check if videos array is not empty and currentIndex is within bounds
                        <>
                            <Video
                                ref={videoRef}
                                style={{ width: 300, height: 200 }}
                                source={{ uri: videos[currentIndex].link }}
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping={false}
                                shouldPlay={isPlaying}
                                useNativeControls={true}
                                onPlaybackStatusUpdate={
                                    handlePlaybackStatusUpdate
                                }
                                className="overflow-hidden rounded-lg"
                            />
                            <Text className="mt-2 text-center text-gray-600 dark:text-gray-400">
                                {videos[currentIndex].gloss}
                            </Text>
                            {/* Display gloss beneath the video */}
                        </>
                    ) : (
                        <Text>No videos available</Text>
                    )}
                    <View className="flex flex-col ">
                        <View className="flex flex-row justify-between mt-2">
                            <Pressable
                                onPress={handlePrevVideo}
                                disabled={currentIndex === 0}
                                style={({ pressed }) => [
                                    {
                                        opacity: pressed ? 0.5 : 1,
                                    },
                                ]}
                                className="flex-grow p-2 mr-1 bg-blue-500 rounded-md"
                            >
                                <Text className="text-center">Prev</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleNextVideo}
                                disabled={currentIndex === videos.length - 1}
                                style={({ pressed }) => [
                                    {
                                        opacity: pressed ? 0.5 : 1,
                                    },
                                ]}
                                className="flex-grow p-2 ml-1 bg-blue-500 rounded-md "
                            >
                                <Text className="text-center ">Next</Text>
                            </Pressable>
                        </View>
                        <Pressable
                            onPress={onClose}
                            className="w-full p-2 mt-2 rounded-md bg-slate-300 dark:bg-slate-500"
                        >
                            <Text className="text-center ">Close</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default VideoPlayerModal;
