import React, { useState, useEffect } from "react";
import {
    Image,
    PermissionsAndroid,
    Platform,
    Pressable,
    View,
} from "react-native";
import {
    RTCPeerConnection,
    RTCView,
    mediaDevices,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
} from "react-native-webrtc";
import { Text } from "@/components/Themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

export default function LiveTranslation() {
    const [localStream, setLocalStream] = useState<MediaStream>();
    const [remoteStream, setRemoteStream] = useState<any>(null);
    const [cachedLocalPC, setCachedLocalPC] = useState<any>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isOffCam, setIsOffCam] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null); // WebSocket connection state
    const [recSdp, setRecSdp] = useState("");
    const [ansSdp, setAnsSdp] = useState();
    const configuration = {
        iceServers: [
            {
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                ],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        let cameraPermission;
        let audioPermission;

        if (Platform.OS === "android") {
            cameraPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA
            );
            audioPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
            );
        } else {
            // Implement permissions logic for iOS if needed
            // For iOS, camera and microphone access is typically handled through Info.plist
            // You might not need to explicitly request permissions here
        }

        if (
            cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
            audioPermission === PermissionsAndroid.RESULTS.GRANTED
        ) {
            startLocalStream();
        } else {
            console.log("Camera or microphone permission denied");
        }
    };

    const startLocalStream = async () => {
        const isFront = true;

        const devices: any = await mediaDevices.enumerateDevices();
        const videoSourceId = devices.find(
            (device: MediaDeviceInfo) => device.kind === "videoinput"
        );
        const facingMode = isFront ? "user" : "environment";
        const constraints = {
            audio: false,
            video: {
                mandatory: {
                    minWidth: 500,
                    minHeight: 300,
                    minFrameRate: 30,
                },
                facingMode,
                optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
            },
        };
        try {
            const stream = await mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
        } catch (error) {
            console.error("Error accessing media devices: ", error);
        }
    };

    const startCall = async () => {
        if (!localStream) return;

        const localPC = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach((track) => {
            localPC.addTrack(track, localStream);
            // console.log("Added track: ", track);
        });

        localPC.addEventListener("icecandidate", async (event) => {
            if (event.candidate) {
                // Send ICE candidate to backend over WebSocket
                ws?.send(
                    JSON.stringify({
                        type: "candidate",
                        candidate: event.candidate,
                    })
                );
            }
        });

        localPC.addEventListener("track", (event) => {
            const newStream = new MediaStream();
            event.streams[0].getTracks().forEach((track) => {
                newStream.addTrack(track);
            });
            setRemoteStream(newStream);
        });

        try {
            const offerOptions = {
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            };

            const offer = await localPC.createOffer(offerOptions);
            await localPC.setLocalDescription(offer);

            // Send offer SDP to backend over WebSocket
            ws?.send(
                JSON.stringify({
                    type: "offer",
                    offer: localPC.localDescription,
                })
            );
            setCachedLocalPC(localPC);

            // console.log("Offer: ", localPC.localDescription);
        } catch (error) {
            console.error("Error starting call: ", error);
        }
    };

    const stopCall = () => {
        if (cachedLocalPC) {
            cachedLocalPC.getSenders().forEach((sender: any) => {
                cachedLocalPC.removeTrack(sender);
                console.log("Removed track: ", sender);
            });
            cachedLocalPC.close();
            setCachedLocalPC(null);
            setRemoteStream(null);
            ws?.send(JSON.stringify({ type: "end_track" }));
        }
    };

    const switchCamera = () => {
        localStream?.getVideoTracks().forEach((track) => track._switchCamera());
    };

    // Mutes the local's outgoing audio
    const toggleMute = () => {
        if (!remoteStream) {
            return;
        }
        localStream?.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        });
    };

    const toggleLive = () => {
        if (!isLive) {
            startCall();
            setIsLive(true);
        } else {
            setIsLive(false);
            stopCall();
        }
    };

    const toggleCamera = () => {
        localStream?.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setIsOffCam(!isOffCam);
        });
    };

    useEffect(() => {
        if (!cachedLocalPC || !ansSdp) return;
        // cachedLocalPC
        //     ?.setRemoteDescription(new RTCSessionDescription(ansSdp))
        //     .then(() => {
        //         console.log("SDP offer set as remote description");
        //     })
        //     .catch((error: any) => {
        //         console.error("Error setting remote description:", error);
        //     });
    }, [cachedLocalPC, ansSdp]);

    const connectWebSocket = () => {
        const newWs = new WebSocket("ws://192.168.29.52:8000/ws/client1");
        newWs.onopen = () => {
            console.log("WebSocket connected");
            setWs(newWs);
        };
        newWs.onmessage = (event: any) => {
            // Receive SDP or ICE candidate from backend over WebSocket

            const message = JSON.parse(event.data);
            console.log(message.answer);

            if (message.type === "answer") {
                // Set remote answer SDP
                setAnsSdp(message.answer);
            } else if (message.type === "candidate") {
                // Add received ICE candidate
                cachedLocalPC?.addIceCandidate(
                    new RTCIceCandidate(message.candidate)
                );
            }
        };
        // newWs.onmessage = async (event) => {
        //     // Receive SDP or ICE candidate from backend over WebSocket
        //     console.log(event.data);
        //     const sdp = event.data;
        //     // Check if the message is an SDP offer or answer
        //     if (sdp.startsWith("v=")) {
        //         // SDP offer
        //         console.log("Received SDP offer");
        //         setRecSdp(sdp);

        //         cachedLocalPC
        //             ?.setRemoteDescription(
        //                 new RTCSessionDescription({
        //                     type: "offer",
        //                     sdp: sdp,
        //                 })
        //             )
        //             .then(() => {
        //                 console.log("SDP offer set as remote description");
        //             })
        //             .catch((error: any) => {
        //                 console.error(
        //                     "Error setting remote description:",
        //                     error
        //                 );
        //             });
        //         // Handle the SDP offer (set as remote description)
        //     } else {
        //         // SDP answer or other message type
        //         console.log("Received SDP answer or other message type");
        //         // Handle SDP answer if needed
        //         // Example: set as remote description

        //         const answer = new RTCSessionDescription({
        //             type: "answer",
        //             sdp: sdp,
        //         });
        //     }
        // };

        newWs.onclose = () => {
            console.log("WebSocket disconnected");
            setWs(null);
        };
    };

    useEffect(() => {
        connectWebSocket();
    }, []);

    return (
        <View
            style={{ flex: 1 }}
            className="w-full h-full bg-slate-50 dark:bg-slate-800"
        >
            {localStream && (
                <View className="relative w-full overflow-hidden border-b rounded-b-[36px] shadow-lg h-4/5">
                    {!isOffCam ? (
                        <RTCView
                            streamURL={localStream.toURL()}
                            objectFit="cover"
                            className="w-full h-full "
                        />
                    ) : (
                        <View className="flex flex-col items-center justify-center w-full h-full bg-slate-900 ">
                            <Image
                                source={require("@/assets/images/disabled-cam.png")}
                            />
                        </View>
                    )}
                    <View className="absolute bottom-0 z-50 w-full bg-[#00000090] flex flex-row items-center justify-evenly h-16">
                        <Pressable onPress={switchCamera}>
                            <MaterialCommunityIcons
                                name="camera-retake"
                                size={32}
                                color="white"
                            />
                        </Pressable>
                        <Pressable onPress={toggleLive}>
                            {!isLive ? (
                                <FontAwesome5
                                    name="play-circle"
                                    size={32}
                                    color="white"
                                />
                            ) : (
                                <FontAwesome5
                                    name="pause-circle"
                                    size={32}
                                    color="white"
                                />
                            )}
                        </Pressable>
                        <Pressable onPress={toggleCamera}>
                            {isOffCam ? (
                                <MaterialCommunityIcons
                                    name="camera"
                                    size={32}
                                    color="white"
                                />
                            ) : (
                                <MaterialCommunityIcons
                                    name="camera-off"
                                    size={32}
                                    color="white"
                                />
                            )}
                        </Pressable>
                    </View>
                </View>
            )}
            {remoteStream && (
                <View className="w-full h-1/5">
                    <RTCView
                        style={{ flex: 1 }}
                        streamURL={remoteStream.toURL()}
                        objectFit="cover"
                    />
                </View>
            )}
        </View>
    );
}
