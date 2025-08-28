import axios from 'axios';

export const url = process.env.REACT_APP_API_URL;

export const axiosInstance = axios.create({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("Token")}`
    },
    baseURL: url
});
