import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLogedInUser, getAllUsers } from "../apiCalls/user";
import { getAllChats } from "../apiCalls/chat";
import { useDispatch } from "react-redux";
import { setUser, setAllUsers, setAllChats } from '../redux/userSlice';
import toast from "react-hot-toast";

function ProtectedRoute({children}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getLogedInUserData = async() => {
            let response = null;
            try {
                response = await getLogedInUser();
                if(response?.success) {
                    dispatch(setUser(response.data));
                }else {
                    toast.error(response.message);
                    navigate("/login");
                }
            } catch (error) {
                navigate("/login");
            }
    }

    const getAllUsersData = async() => {
        let response = null;
        try {
            response = await getAllUsers();
            if(response?.success) {
                dispatch(setAllUsers(response.data));
            }else {
                toast.error(response.message);
                navigate("/login");
            }
        } catch (error) {
            navigate("/login");
        }
    }

    const getAllChatsData = async() => {
        let response = null;
        try {
            response = await getAllChats();
            if(response?.success) {
                dispatch(setAllChats(response.data));
            }
        } catch (error) {
            navigate("/login");
        }
    }

    
    useEffect(() => {
        if(localStorage.getItem("Token")) {
            // Get Detail of User
            getLogedInUserData(); 
            getAllUsersData();
            getAllChatsData();
        }
        else {
            navigate("/login")
        }
    }, [])
    return (
    <>
        {children}
    </>)
}

export default ProtectedRoute;