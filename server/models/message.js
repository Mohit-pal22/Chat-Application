const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId, ref: "chats"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId, ref: "users"
    },
    text: {
        type: String,
        require: false
    },
    image: {
        type: String,
        required: false
    },
    status: {
        type: Boolean,
        default: false
    }
},{timestamps: true})

module.exports = mongoose.model('messages', messageSchema);