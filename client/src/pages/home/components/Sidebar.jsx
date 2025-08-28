import { useState } from "react";
import Search from "./Search";
import UserList from "./UserList";

function Sidebar({ socket, onlineUsers }) {
    const [searchKey, setSearchKey] = useState('');
    return (
        <div className="app-sidebar">
            <Search
                searchKey={searchKey}
                setSearchKey={setSearchKey}
            />
            <UserList
                searchKey={searchKey}
                socket={socket}
                onlineUsers={onlineUsers}
            />
        </div>
    )
}

export default Sidebar;