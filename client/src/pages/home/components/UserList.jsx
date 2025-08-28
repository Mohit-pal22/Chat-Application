import { useDispatch, useSelector } from "react-redux";
import { startChat } from "../../../apiCalls/chat";
import { showLoader, hideLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "../../../redux/userSlice"
import toast from "react-hot-toast";
import { axiosInstance } from "../../../apiCalls";
import moment from "moment"
import { useEffect } from "react";
import store from "../../../redux/store";

function UserList({ searchKey, socket, onlineUsers }) {
    const { user: currentUser, allUsers, allChats, selectedChat } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();

    const startNewChat = async (searchedUserId) => {
        try {
            dispatch(showLoader());
            const response = await startChat([currentUser._id, searchedUserId])
            dispatch(hideLoader());
            if (response.success) {
                toast.success(response.message);
                const newChat = response.data;
                const updatedChats = [...allChats, newChat];
                dispatch(setAllChats(updatedChats));
                dispatch(setSelectedChat(newChat));
            }

        } catch (error) {
            toast.error(error.message);
            dispatch(hideLoader());
        }
    }

    const openChat = async (selectedUserId) => {
        const chat = allChats.find(chat =>
            chat.members.some(m => m._id === currentUser._id) &&
            chat.members.some(m => m._id === selectedUserId)
        );

        if (chat) {
            dispatch(setSelectedChat(chat));
            const messages = await axiosInstance.get(`/api/message/messages/${chat._id}`);
            // Dispatch or handle messages if needed
        }
    };

    const IsSelectedChat = (user) => {
        if (selectedChat) {
            return selectedChat.members.map(m => m._id).includes(user._id);
        }
        return false;
    }

    const getLastMessageTimeStamp = (userId) => {
        const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));

        if (!chat || !chat.lastMessage) {
            return "";
        } else {
            return moment(chat?.lastMessage?.createdAt).format("hh:mm A");
        }
    }

    const getLastMessage = (userId) => {
        const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));

        if (!chat || !chat.lastMessage) {
            return "";
        } else {
            const msgPrefix = chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
            return msgPrefix + chat?.lastMessage?.text?.substring(0, 25);
        }
    }

    function formatName(user) {
        let fname = user.firstname.at(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
        let lname = user.lastname.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase();

        return fname + " " + lname;
    }

    const getUnreadMsgCount = (userId) => {
        const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId))

        if (chat && chat.unreadMessageCount && chat.lastMessage.sender !== currentUser._id) {
            return <div className="unread-message-counter">{chat.unreadMessageCount}</div>;
        } else {
            return "";
        }

    }

    function getData() {
        if (searchKey === "") {
            return allChats;
        }
        else {
            return allUsers.filter(user => {
                return user.firstname.toLowerCase().includes(searchKey.toLowerCase()) ||
                    user.lastname.toLowerCase().includes(searchKey.toLowerCase());
            });
        }
    }

    useEffect(() => {
        socket.off('set-msg-count').on('set-msg-count', (message) => {
            const selectedChat = store.getState().userReducer.selectedChat;
            let allChats = store.getState().userReducer.allChats;

            if (selectedChat?._id !== message.chatId) {
                const updatedChats = allChats.map((chat) => {
                    return (chat._id === message.chatId) ? {
                        ...chat, unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
                        lastMessage: message
                    } : chat;
                })
                allChats = updatedChats;
            }
            const latestChat = allChats.find(chat => chat._id === message.chatId);
            const otherChats = allChats.filter(chat => chat._id !== message.chatId);
            allChats = [latestChat, ...otherChats];
            dispatch(setAllChats(allChats));
        })
    }, [])

    return (
        getData()
            .map(obj => {
                let user = obj;
                if (obj.members) {
                    user = obj.members.find(mem => mem._id !== currentUser._id);
                }
                return (
                    <div className="user-search-filter" onClick={() => openChat(user._id)} key={user._id}>
                        <div className={IsSelectedChat(user) ? "selected-user" : "filtered-user"}>
                            <div className="filter-user-display">
                                {user?.profilePic &&
                                    <img
                                        src={user.profilePic}
                                        alt="Profile Pic"
                                        className="user-profile-image"
                                        style={onlineUsers.includes(user._id) ? { border: '#82e0aa 3px solid' } : {}}
                                    />
                                }
                                {!user.profilePic &&
                                    <div 
                                        className={IsSelectedChat(user) ? "user-selected-avatar" : "user-default-avatar"}
                                        style={onlineUsers.includes(user._id) ? { border: '#82e0aa 3px solid' } : {}}
                                    >
                                        {
                                            user?.firstname?.charAt(0).toUpperCase() +
                                            user?.lastname?.charAt(0).toUpperCase()
                                        }
                                    </div>
                                }
                                <div className="filter-user-details">
                                    <div className="user-display-name">{formatName(user)}
                                    </div>
                                    <div className="user-display-email">{getLastMessage(user._id) || user?.email}</div>
                                </div>
                                <div>
                                    {getUnreadMsgCount(user._id)}
                                    <div className="last-message-timestamp">{getLastMessageTimeStamp(user._id)}</div>
                                </div>
                                {!allChats.find(chat => chat.members.map(m => m._id).includes(user._id)) &&
                                    <div className="user-start-chat">
                                        <button className="user-start-chat-btn" onClick={() => startNewChat(user?._id)}>Start Chat</button>
                                    </div>}
                            </div>
                        </div>
                    </div>
                );
            })
    )
}

export default UserList;