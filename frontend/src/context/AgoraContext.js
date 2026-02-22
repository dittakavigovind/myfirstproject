"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { API_BASE } from '../lib/urlHelper';

const AgoraContext = createContext();

export const useAgora = () => useContext(AgoraContext);

const API_URL = API_BASE;
// const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID; 
// We will access process.env.NEXT_PUBLIC_AGORA_APP_ID directly.

export const AgoraProvider = ({ children }) => {
    const { user } = useAuth();
    const [rtcClient, setRtcClient] = useState(null);
    const [rtmClient, setRtmClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [incomingCall, setIncomingCall] = useState(null); // { callerId, channelName, type }

    // Store SDKs in refs to access them in functions without re-importing
    const AgoraRTC = useRef(null);
    const AgoraRTM = useRef(null);

    useEffect(() => {
        // Initialize Clients
        const initAgora = async () => {
            if (!user) return;
            if (typeof window === 'undefined') return; // Ensure client-side

            try {
                // Dynamic Import to avoid SSR "window is not defined" error
                const AgoraRTCModule = (await import('agora-rtc-sdk-ng')).default;
                const AgoraRTMModule = (await import('agora-rtm-sdk')).default;

                AgoraRTC.current = AgoraRTCModule;
                AgoraRTM.current = AgoraRTMModule;

                // Initialize RTC
                const rtc = AgoraRTC.current.createClient({ mode: 'rtc', codec: 'vp8' });
                setRtcClient(rtc);

                const rtm = AgoraRTMModule.createInstance(process.env.NEXT_PUBLIC_AGORA_APP_ID);
                setRtmClient(rtm);
            } catch (err) {
                console.error("Agora Init Failed", err);
            }
        };

        initAgora();
    }, [user]);

    // RTM Login Effect
    useEffect(() => {
        const loginRTM = async () => {
            if (!rtmClient || !user || !AgoraRTM.current) return;

            try {
                // Get Token
                const { data } = await axios.post(`${API_URL}/agora/token`, {
                    channelName: 'lobby',
                    uid: user._id
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                if (data.success && data.rtmToken) {
                    await rtmClient.login({ uid: user._id, token: data.rtmToken });
                    console.log('RTM Logged In');

                    rtmClient.on('MessageFromPeer', (message, peerId) => {
                        try {
                            const msgData = JSON.parse(message.text);
                            if (msgData.type === 'call_invite') {
                                setIncomingCall({
                                    callerId: peerId,
                                    channelName: msgData.channelName,
                                    callerName: msgData.callerName || 'User',
                                    type: msgData.callType || 'video'
                                });
                            }
                        } catch (e) { console.error(e); }
                    });
                }
            } catch (err) {
                console.error('RTM Login Failed', err);
            }
        };

        loginRTM();
    }, [rtmClient, user]);

    const inviteUser = async (peerId, channelName, callType = 'video') => {
        if (!rtmClient) return false;
        try {
            const msg = JSON.stringify({
                type: 'call_invite',
                channelName,
                callerName: user?.name,
                callType
            });
            await rtmClient.sendMessageToPeer({ text: msg }, peerId);
            return true;
        } catch (err) {
            console.error('Send Invite Failed', err);
            return false;
        }
    };

    // Function to start a call (Get tokens -> Join)
    const startCall = async (channelName, type = 'video') => {
        if (!rtcClient || !AgoraRTC.current) return;

        try {
            // 1. Get Token from Backend
            const { data } = await axios.post(`${API_URL}/agora/token`, {
                channelName,
                uid: 0 // Allow Agora to assign or use numeric mapping if needed. But best if we use Int UID.
                // If user.id is string, we might need mapped Int or account mode.
                // Let's assume Backend handles Account Mode.
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (data.success) {
                // 2. Join RTC Channel
                await rtcClient.join(data.appID, channelName, data.rtcToken, user._id); // Join with String ID (User Account)

                // 3. Create & Publish Tracks
                // Use the ref
                const audioTrack = await AgoraRTC.current.createMicrophoneAudioTrack();
                setLocalAudioTrack(audioTrack);

                let tracks = [audioTrack];
                if (type === 'video') {
                    const videoTrack = await AgoraRTC.current.createCameraVideoTrack();
                    setLocalVideoTrack(videoTrack);
                    tracks.push(videoTrack);
                }

                await rtcClient.publish(tracks);
                return true;
            }
        } catch (error) {
            console.error("Start Call Failed", error);
            return false;
        }
    };

    const leaveCall = async () => {
        if (localAudioTrack) {
            localAudioTrack.close();
            setLocalAudioTrack(null);
        }
        if (localVideoTrack) {
            localVideoTrack.close();
            setLocalVideoTrack(null);
        }
        if (rtcClient) {
            await rtcClient.leave();
        }
        setRemoteUsers([]);
    };

    return (
        <AgoraContext.Provider value={{
            rtcClient,
            rtmClient,
            localAudioTrack,
            localVideoTrack,
            remoteUsers,
            startCall,
            leaveCall,
            leaveCall,
            incomingCall,
            setIncomingCall,
            inviteUser
        }}>
            {children}
        </AgoraContext.Provider>
    );
};
