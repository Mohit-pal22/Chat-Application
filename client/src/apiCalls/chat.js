import { axiosInstance } from "./index";

async function getAllChats() {
    try {
        const response = await axiosInstance.get('/api/chat/chats');
        if(response.success)    return response.data;
        else    return response.data;
    } catch (error) {
        return error;
    }
}

async function startChat(members) {
    try {
        const response = await axiosInstance.post('/api/chat/chats', {members})
        return response.data;
    } catch (error) {
        return error;
    }
}

async function clearUnreadMsgCount(chatId) {
    try {
        const response = await axiosInstance.post('/api/chat/clear-unread-msg', {chatId})
        return response.data;
    } catch (error) {
        return error;
    }
}

export { getAllChats, startChat, clearUnreadMsgCount };