const axios = require('axios');
const Session = require('../models/Session');

// Helper to get basic auth for Agora REST API
const getAgoraAuthHeader = () => {
    const credentials = `${process.env.AGORA_CUSTOMER_ID}:${process.env.AGORA_CUSTOMER_CERTIFICATE}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

exports.acquireRecordingResource = async (req, res) => {
    try {
        const { channelName, uid } = req.body;
        const response = await axios.post(`https://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/acquire`, {
            cname: channelName,
            uid: uid || "999999", // Dummy UID for recorder
            clientRequest: {
                resourceExpiredHour: 24,
                scene: 0
            }
        }, {
            headers: { Authorization: getAgoraAuthHeader() }
        });

        res.status(200).json({ success: true, resourceId: response.data.resourceId });
    } catch (err) {
        console.error('Acquire Resource Error:', err.response?.data || err.message);
        res.status(500).json({ success: false, message: 'Failed to acquire recording resource' });
    }
};

exports.startRecording = async (req, res) => {
    try {
        const { channelName, uid, resourceId, token } = req.body;
        
        const response = await axios.post(`https://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/mix/start`, {
            cname: channelName,
            uid: uid || "999999",
            clientRequest: {
                token: token,
                recordingConfig: {
                    maxIdleTime: 120,
                    streamTypes: 2, // Audio and Video
                    channelType: 0,
                    videoStreamType: 1, // Low bitrate / quality for storage
                    transcodingConfig: {
                        height: 360,
                        width: 640,
                        bitrate: 400,
                        fps: 15,
                        mixedVideoLayout: 1,
                        backgroundColor: "#000000"
                    }
                },
                storageConfig: {
                    vendor: 1, // AWS S3
                    region: parseInt(process.env.AWS_REGION_AGORA_CODE || 0),
                    bucket: process.env.AWS_BUCKET_NAME,
                    accessKey: process.env.AWS_ACCESS_KEY_ID,
                    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
                    fileNamePrefix: ["recordings", channelName]
                }
            }
        }, {
            headers: { Authorization: getAgoraAuthHeader() }
        });

        // Save SID to session to stop it later
        await Session.findOneAndUpdate({ roomId: channelName }, {
            agoraResourceId: resourceId,
            agoraSid: response.data.sid
        });

        res.status(200).json({ success: true, sid: response.data.sid });
    } catch (err) {
        console.error('Start Recording Error:', err.response?.data || err.message);
        res.status(500).json({ success: false, message: 'Failed to start recording' });
    }
};

exports.stopRecording = async (req, res) => {
    try {
        const { channelName, uid, resourceId, sid } = req.body;
        
        let sessionSid = sid;
        let sessionResId = resourceId;

        // Fallback to database if not provided by client
        if (!sid || !resourceId) {
            const session = await Session.findOne({ roomId: channelName });
            if (session && session.agoraSid) {
                sessionSid = session.agoraSid;
                sessionResId = session.agoraResourceId;
            } else {
                return res.status(400).json({ success: false, message: 'Recording SID not found' });
            }
        }

        const response = await axios.post(`https://api.agora.io/v1/apps/${process.env.AGORA_APP_ID}/cloud_recording/resourceid/${sessionResId}/sid/${sessionSid}/mode/mix/stop`, {
            cname: channelName,
            uid: uid || "999999",
            clientRequest: {}
        }, {
            headers: { Authorization: getAgoraAuthHeader() }
        });

        // Store final path in DB
        const serverResponse = response.data.serverResponse;
        const fileList = serverResponse.fileList; // Returns a path like "recordings/channelName/xxx.m3u8"
        
        await Session.findOneAndUpdate({ roomId: channelName }, {
            recordingUrl: fileList 
        });

        res.status(200).json({ success: true, fileList });
    } catch (err) {
        console.error('Stop Recording Error:', err.response?.data || err.message);
        res.status(500).json({ success: false, message: 'Failed to stop recording' });
    }
};
