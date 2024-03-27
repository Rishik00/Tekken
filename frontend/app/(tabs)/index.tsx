import React, { useState, useEffect } from "react";
import { Pressable, View } from "react-native";
import {
    RTCPeerConnection,
    RTCView,
    mediaDevices,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
} from "react-native-webrtc";
import axios from "axios"; // Import axios for HTTP requests
import { Text } from "@/components/Themed";

const LiveTranslation = () => {
    const [localStream, setLocalStream] = useState<MediaStream>();
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [cachedLocalPC, setCachedLocalPC] =
        useState<RTCPeerConnection | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isOffCam, setIsOffCam] = useState(false);
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
        startLocalStream();
    }, []);

    const startLocalStream = async () => {
        const isFront = true;
        const devices: any = await mediaDevices.enumerateDevices();
        const videoSourceId = devices.find(
            (device: MediaDeviceInfo) => device.kind === "videoinput"
        );
        const facingMode = isFront ? "user" : "environment";
        const constraints = {
            audio: true,
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
        });

        localPC.addEventListener("icecandidate", async (event) => {
            if (event.candidate) {
                try {
                    await axios.post("YOUR_BACKEND_ICE_ENDPOINT", {
                        candidate: event.candidate.toJSON(),
                    });
                } catch (error) {
                    console.error("Error sending ICE candidate: ", error);
                }
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

            await axios.post("YOUR_BACKEND_SDP_OFFER_ENDPOINT", {
                offer: localPC.localDescription?.toJSON(),
            });

            // Listen for remote SDP answer
            // Assume you have an endpoint to receive SDP answer from the server

            // Listen for ICE candidates from the server
            // Assume you have an endpoint to receive ICE candidates from the server
        } catch (error) {
            console.error("Error starting call: ", error);
            // Cleanup code if necessary
        }

        setCachedLocalPC(localPC);
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

    const toggleCamera = () => {
        localStream?.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setIsOffCam(!isOffCam);
        });
    };

    return (
        <View style={{ flex: 1 }}>
            {/* {localStream && (
                <RTCView
                    style={{ flex: 1 }}
                    streamURL={localStream.toURL()}
                    objectFit="cover"
                />
            )} */}
            <View className="absolute bottom-0 w-full">
                {/* Pressable for starting a call */}
                <Pressable onPress={startCall}>
                    <Text>Start Call</Text>
                </Pressable>

                {/* Pressable for switching camera */}
                <Pressable onPress={switchCamera}>
                    <Text>Switch Camera</Text>
                </Pressable>

                {/* Pressable for toggling mute */}
                <Pressable onPress={toggleMute}>
                    <Text>Toggle Mute</Text>
                </Pressable>

                {/* Pressable for toggling camera */}
                <Pressable onPress={toggleCamera}>
                    <Text>Toggle Camera</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default LiveTranslation;
