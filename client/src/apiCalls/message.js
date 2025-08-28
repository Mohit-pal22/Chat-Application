import { axiosInstance } from './index';

async function createNewMessage(message) {
    try {
        const response = await axiosInstance.post('/api/message/messages', message)
        return response.data;
    } catch (error) {
        return error;
    }
}

async function getAllMessages(chatId) {
    try {
        const response = await axiosInstance.get(`/api/message/messages/${chatId}`);
        return response.data;
    } catch (error) {
        return error;
    }
}

export { createNewMessage, getAllMessages };