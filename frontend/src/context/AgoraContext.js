"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import API from '../lib/api';

const AgoraContext = createContext();

export const useAgora = () => useContext(AgoraContext);

export const AgoraProvider = ({ children }) => {
    const { user } = useAuth();
    const [rtcClient, setRtcClient] = useState(null);
    const [rtmClient, setRtmClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [incomingCall, setIncomingCall] = useState(null);

    const AgoraRTC = useRef(null);
    const AgoraRTM = useRef(null);

    useEffect(() => {
        const initAgora = async () => {
            if (!user) return;
            if (typeof window === 'undefined') return;

            try {
                const AgoraRTCModule = (await import('agora-rtc-sdk-ng')).default;
                const AgoraRTMModule = (await import('agora-rtm-sdk')).default;

                AgoraRTC.current = AgoraRTCModule;
                AgoraRTM.current = AgoraRTMModule;

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

    useEffect(() => {
        const loginRTM = async () => {
            if (!rtmClient || !user || !AgoraRTM.current) return;

            try {
                const { data } = await API.post('/agora/token', {
                    channelName: 'lobby',
                    uid: user._id
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

    const startCall = async (channelName, type = 'video') => {
        if (!rtcClient || !AgoraRTC.current) return;

        try {
            const { data } = await API.post('/agora/token', {
                channelName,
                uid: 0
            });

            if (data.success) {
                await rtcClient.join(data.appID, channelName, data.rtcToken, user._id);

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
