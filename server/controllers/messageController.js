const Message = require("../models/message.js");
const Chat = require("../models/chat.js");

async function sendMessage(req, res) {
    try {
        const newMessage = new Message(req.body);
        const savedMessage = await newMessage.save(); 
        await Chat.findOneAndUpdate({_id: req.body.chatId}, 
            {
            lastMessage: savedMessage._id,
            $inc: {unreadMessageCount: 1}
        });
        res.status(200).send({
            message: "Message Send Successfully",
            data: savedMessage,
            success: true
        })
    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
}

async function getAllMessages(req, res) {
    try {
        const messages = await Message.find({chatId: req.params.chatId}).sort({createdAt: 1});
        res.status(200).send({
            message: "Messages Fetch Successfull",
            success: true,
            data: messages
        })
    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
}

async function deleteMessage(req, res) {}

module.exports = {sendMessage, getAllMessages};