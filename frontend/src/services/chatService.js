import API from '../lib/api';

export const startPaidChat = async (astrologerId) => {
    try {
        const response = await API.post('/chat/start-paid', { astrologerId });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: 'Failed to start chat session' };
    }
};

export const getMessages = async (roomId) => {
    try {
        const response = await API.get(`/chat/${roomId}/messages`);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: 'Failed to fetch messages' };
    }
};

export const getSessionMessages = async (roomId) => {
    try {
        const response = await API.get(`/chat/session/${roomId}/messages`);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: 'Failed to fetch messages' };
    }
};
