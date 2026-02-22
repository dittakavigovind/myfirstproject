"use client";

import { useEffect, useRef, useState } from 'react';
import { useAgora } from '../../../context/AgoraContext';
import { useParams, useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

export default function CallPage() {
    const { id: channelName } = useParams(); // Using the dynamic route ID as the channel name
    const router = useRouter();
    const {
        localAudioTrack,
        localVideoTrack,
        leaveCall,
        startCall,
        remoteUsers
    } = useAgora();

    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});

    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const initCall = async () => {
            if (channelName && !joined) {
                const success = await startCall(channelName);
                if (success && isMounted) {
                    setJoined(true);
                } else if (!success) {
                    alert("Failed to join call");
                    router.back();
                }
            }
        };

        if (channelName) {
            initCall();
        }

        return () => {
            isMounted = false;
            leaveCall();
        };
    }, [channelName]);

    // Play Local Video
    useEffect(() => {
        if (joined && localVideoTrack && localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
        }
    }, [joined, localVideoTrack]);

    // Play Remote User Videos
    useEffect(() => {
        if (joined && remoteUsers.length > 0) {
            remoteUsers.forEach(user => {
                const elementId = `remote-user-${user.uid}`;
                const container = document.getElementById(elementId);
                if (container && user.videoTrack) {
                    user.videoTrack.play(container);
                }
                if (user.audioTrack) {
                    user.audioTrack.play();
                }
            });
        }
    }, [joined, remoteUsers]);

    const toggleMic = async () => {
        if (localAudioTrack) {
            await localAudioTrack.setEnabled(!micOn);
            setMicOn(!micOn);
        }
    };

    const toggleCamera = async () => {
        if (localVideoTrack) {
            await localVideoTrack.setEnabled(!cameraOn);
            setCameraOn(!cameraOn);
        }
    };

    const handleEndCall = async () => {
        await leaveCall();
        router.back();
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">

            {/* Remote Video (Full Screen or Grid) */}
            <div className="flex-1 w-full flex items-center justify-center p-4">
                {remoteUsers.length === 0 ? (
                    <div className="text-white text-center">
                        <div className="animate-pulse text-2xl mb-4">Waiting for others to join...</div>
                        <p className="text-gray-400">Channel: {channelName}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-w-6xl">
                        {remoteUsers.map(user => (
                            <div
                                key={user.uid}
                                id={`remote-user-${user.uid}`}
                                className="bg-black rounded-2xl overflow-hidden relative w-full h-full min-h-[300px]"
                            >
                                <span className="absolute top-4 left-4 text-white bg-black/50 px-2 py-1 rounded text-sm z-10">
                                    User {user.uid}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Local Video (Floating) */}
            <div
                ref={localVideoRef}
                className="absolute top-4 right-4 w-48 h-32 bg-black rounded-xl border-2 border-gray-800 overflow-hidden shadow-2xl z-20"
            >
                <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-1 rounded">You</div>
                {!cameraOn && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xs">
                        Camera Off
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="w-full p-8 flex justify-center gap-6 z-30 bg-gradient-to-t from-black/80 to-transparent">
                <button
                    onClick={toggleMic}
                    className={`p-4 rounded-full transition-all ${micOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 text-white'}`}
                >
                    {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>

                <button
                    onClick={handleEndCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 transform hover:scale-110 transition-all"
                >
                    <PhoneOff size={32} />
                </button>

                <button
                    onClick={toggleCamera}
                    className={`p-4 rounded-full transition-all ${cameraOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 text-white'}`}
                >
                    {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
            </div>
        </div>
    );
}
