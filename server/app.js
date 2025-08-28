const express = require('express');
const authRouter = require('./routers/authRouter');
const userRouter = require("./routers/userRouter");
const chatRouter = require("./routers/chatRouter");
const messageRouter = require("./routers/messageRouter");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST']
    }
})
app.use(express.json({
    limit: '5mb'
}));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

const onlineUsers = [];

io.on('connection', socket => {
    socket.on("join-room", userId => {
        socket.join(userId);
    })

    socket.on("send-msg", (message) => {
        io.to(message.members[0])
        .to(message.members[1])
        .emit('receive-msg', message)
        io.to(message.members[0])
        .to(message.members[1])
        .emit('set-msg-count', message)
    })

    socket.on('clear-unread-msg', data => {
        io.to(data.members[0])
        .to(data.members[1])
        .emit('msg-count-cleared', data)
    })

    socket.on('user-typing', (data) => {
        io
        .to(data.members[0])
        .to(data.members[1])
        .emit('typing', data);
    })

    socket.on('user-login', (userId) => {
        if(!onlineUsers.includes(userId)) {
            onlineUsers.push(userId);
        }
        socket.emit('online-users', onlineUsers);
    })

    socket.on('user-offline', (userId) => {
        onlineUsers.splice(onlineUsers.indexOf(userId), 1);
        io.emit('online-users-updated', onlineUsers);
    })
})


module.exports = server;