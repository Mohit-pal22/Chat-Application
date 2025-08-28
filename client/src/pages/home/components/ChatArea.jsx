import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages } from "../../../apiCalls/message";
import { clearUnreadMsgCount } from "../../../apiCalls/chat"
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import toast from "react-hot-toast"
import { useEffect, useState } from "react";
import { setAllChats, setSelectedChat } from "../../../redux/userSlice";
import store from "../../../redux/store"
import moment from "moment";
import EmojiPicker from 'emoji-picker-react';

function ChatArea({ socket }) {
    const dispatch = useDispatch();
    const { selectedChat, user, allChats } = useSelector(state => state.userReducer);
    const selectedUser = selectedChat.members.find(u => u._id !== user._id);
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [data, setData] = useState(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const sendMessage = async (image) => {
        try {
            const newMessage = {
                chatId: selectedChat._id,
                sender: user._id,
                text: message,
                image
            }

            socket.emit("send-msg", {
                ...newMessage,
                members: selectedChat.members.map(m => m._id),
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
            })
            const response = await createNewMessage(newMessage);

            if (response.success) {
                setMessage("");
                setShowEmojiPicker(false);
            }
        } catch (error) {
            dispatch(hideLoader());
            toast.error(error.message);
        }
    }

    const getMessages = async () => {
        try {
            socket.emit('clear-unread-msg', {
                chatId: selectedChat._id,
                members: selectedChat.members.map(m => m._id)
            })
            const response = await getAllMessages(selectedChat._id);
            if (response.success) {
                setAllMessages(response.data);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const clearUnreadMsgs = async () => {
        try {
            socket.emit('clear-unread-msg', {
                chatId: selectedChat._id,
                members: selectedChat.members.map(m => m._id)
            })
            const response = await clearUnreadMsgCount(selectedChat._id);

            if (response.success) {
                allChats.map(chat => {
                    if (chat._id === selectedChat._id) {
                        return response.data;
                    }
                    return chat;
                })
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const formatTime = (timestamp) => {
        const now = moment();
        const diff = now.diff(moment(timestamp), "days")

        if (diff < 1) {
            return `Today ${moment(timestamp).format('hh:mm A')}`;
        } else if (diff === 1) {
            return `Yestarday ${moment(timestamp).format("hh:mm A")}`;
        } else {
            return ` ${moment(timestamp).format("MMM D, hh:mm A")}`;
        }
    }

    function formatName(user) {
        let fname = user.firstname.at(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
        let lname = user.lastname.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase();

        return fname + " " + lname;
    }

    const sendImage = async(e) => {
        const file = e.target.files[0];
        const reader = new FileReader(file);
        reader.readAsDataURL(file);

        reader.onloadend = async() => {
            sendMessage(reader.result);
        }
    }

    useEffect(() => {
        getMessages();
        if (selectedChat?.lastMessage?.sender !== user._id) {
            clearUnreadMsgs();
        }

        socket.off('receive-msg').on('receive-msg', (message) => {
            const selectedChat = store.getState().userReducer.selectedChat;
            if (selectedChat._id === message.chatId)
                setAllMessages(prevMsg => [...prevMsg, message])
            if (selectedChat._id === message.chatId && message.sender !== user._id) {
                clearUnreadMsgs();
            }
        })

        socket.on('msg-count-cleared', data => {
            const selectedChat = store.getState().userReducer.selectedChat;
            const allChats = store.getState().userReducer.allChats;

            if (selectedChat._id === data.chatId) {
                //UPDATING UNREAD MESSAGE COUNT IN CHAT OBJECT
                const updatedChats = allChats.map(chat => {
                    if (chat._id === data.chatId) {
                        return { ...chat, unreadMessageCount: 0 }
                    }
                    return chat;
                })
                dispatch(setAllChats(updatedChats));

                //UPDATING READ PROPRTY IN MESSAGE OBJECT
                setAllMessages(prevMsgs => {
                    return prevMsgs.map(msg => {
                        return { ...msg, status: true }
                    })
                })
            }
        })

        socket.on('typing', (data) => {
            setData(data);
            if (selectedChat._id === data.chatId && data.sender !== user._id) {
                setTyping(true);
                setTimeout(() => {
                    setTyping(false);
                }, 2000);
            }
        })
    }, [selectedChat, typing])

    useEffect(() => {
        const msgContainer = document.getElementById("main-chat-area");
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }, [allMessages])

    return <>
        {selectedChat && <div className="app-chat-area">
            <div className="app-chat-area-header">
                {formatName(selectedUser)}
            </div>
            <div className="main-chat-area" id="main-chat-area">
                {allMessages.map(msg => {
                    const isCurrentUserSender = msg.sender === user._id;
                    return (
                        <div className="message-container" key={msg._id} style={isCurrentUserSender ? { justifyContent: 'end' } : { justifyContent: 'start' }}>
                            <div>
                                <div className={isCurrentUserSender ? "send-message" : "received-message"}>
                                    <div>{msg?.image && <img src={msg.image} alt='image' height="120" width="120"/>}</div>
                                    <div>{msg.text}</div>
                                </div>
                                <div className="message-timestamp" style={isCurrentUserSender ? { float: "right" } : { float: "left" }}>
                                    {formatTime(msg.createdAt)}
                                    {isCurrentUserSender && msg.status && <i className="fa fa-check-circle" aria-hidden="true" style={{ color: "#e74c3c" }}></i>}
                                </div>
                            </div>
                        </div>)
                })}
                <div className="typing-indicator" key={Date.now()}>
                    {typing && selectedChat?.members.map(m => m._id).includes(data?.sender) && <i>typing...</i>}
                </div>
            </div>

            {showEmojiPicker && 
            <div style={{width: "100%", display: "flex", padding: "0px 20px", justifyContent: "right"}}>
                <EmojiPicker 
                    style={{width: "300px", height: "400px"}}
                    onEmojiClick={(e) => setMessage(message + e.emoji)}
                />
            </div>}
            <div className="send-message-div">
                <input type="text" className="send-message-input" placeholder="Type a message"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value)
                        socket.emit('user-typing', {
                            chatId: selectedChat._id,
                            members: selectedChat.members.map(m => m._id),
                            sender: user._id
                        })
                    }}
                />
                <label htmlFor="file">
                    <i className="fa fa-picture-o send-img-btn"></i>
                    <input
                        type="file"
                        id="file"
                        style={{display: 'none'}}
                        accept="image/jpg,image/png,image/jpeg,image/gif"
                        onChange={sendImage}
                    ></input>
                </label>
                <button className="fa fa-smile-o send-emoji-btn" aria-hidden="true"
                    onClick={() => {setShowEmojiPicker(!showEmojiPicker)} }></button>
                <button className="fa fa-paper-plane send-message-btn" aria-hidden="true"
                    onClick={() => sendMessage("")}></button>
            </div>
        </div>}
    </>
}

export default ChatArea;