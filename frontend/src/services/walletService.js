import axios from 'axios';
import { API_BASE } from '../lib/urlHelper';

const API_URL = API_BASE;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getWalletBalance = async () => {
    const response = await axios.get(`${API_URL}/wallet/balance`, getAuthHeader());
    return response.data;
};

export const addMoney = async (amount) => {
    const response = await axios.post(`${API_URL}/wallet/recharge`, { amount }, getAuthHeader());
    return response.data;
};

export const getTransactions = async (page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/wallet/transactions?page=${page}&limit=${limit}`, getAuthHeader());
    return response.data;
};

export const verifyPayment = async (data) => {
    const response = await axios.post(`${API_URL}/wallet/verify-payment`, data, getAuthHeader());
    return response.data;
};
