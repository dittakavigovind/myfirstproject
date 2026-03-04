import API from '../lib/api';

export const getWalletBalance = async () => {
    try {
        const response = await API.get('/wallet/balance');
        return response.data;
    } catch (error) {
        return { success: false, message: 'Failed to fetch balance' };
    }
};

export const addMoney = async (amount) => {
    try {
        const response = await API.post('/wallet/recharge', { amount });
        return response.data;
    } catch (error) {
        return { success: false, message: 'Failed to initiate recharge' };
    }
};

export const getTransactions = async (page = 1, limit = 10) => {
    try {
        const response = await API.get(`/wallet/transactions?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        return { success: false, message: 'Failed to fetch transactions' };
    }
};

export const verifyPayment = async (data) => {
    try {
        const response = await API.post('/wallet/verify-payment', data);
        return response.data;
    } catch (error) {
        return { success: false, message: 'Payment verification failed' };
    }
};
