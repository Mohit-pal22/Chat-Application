const Chat = require("../models/chat.js");
const Message = require("../models/message.js");

async function createNewChat(req, res) {
    try {
        const chat = new Chat(req.body);
        const savedChat = await chat.save();

        await savedChat.populate('members');
        res.status(201).send({
            message: "Chat created successfully",
            success: true,
            data: savedChat
        })

    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
}

async function getAllChats(req, res) {
    try {
        const chats = await Chat.find({ members: { $in: req.userId } })
            .populate("members")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.status(200).send({
            message: "All Chats fetched Successfully",
            success: true,
            data: chats
        })

    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
}

async function clearUnreadMsg(req, res) {
    try {
        const chatId = req.body.chatId;
        const chat = await Chat.findById(chatId);
        if (!chat) {
            res.send({
                message: 'No Chat found with give chatId',
                success: false
            })
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { unreadMessageCount: 0 },
            { new: true }
        ).populate('members').populate('lastMessage');

        await Message.updateMany(
            {chatId: chatId, status: false},
            {status: true}
        )

        res.send( {
            message: "Unread message cleared successfully",
            success: true,
            data: updatedChat
        })
    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
}

module.exports = { createNewChat, getAllChats, clearUnreadMsg }