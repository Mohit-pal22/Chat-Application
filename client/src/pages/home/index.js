import { useSelector } from "react-redux";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io(process.env.REACT_APP_API_URL);

function Home() {
    const { selectedChat, user } = useSelector(state => state.userReducer);
    const [onlineUsers, setOnlineUsers] = useState([])

    useEffect(() => {
        if(user) {
            socket.emit("join-room", user._id);
            socket.emit("user-login", user._id);
            socket.on('online-users', onlineUsers => {
                setOnlineUsers(onlineUsers);
            })
            socket.on('online-users-updated', onlineUsers => {
                setOnlineUsers(onlineUsers);
            })
        }
    }, [user, setOnlineUsers]);


    return (
        <div className="home-page">
            <Header socket={socket}/>
            <div className="main-content">
                <Sidebar socket={socket} onlineUsers={onlineUsers}/>
                {selectedChat && <ChatArea socket={socket}/>}
            </div>
        </div>)
}

export default Home;