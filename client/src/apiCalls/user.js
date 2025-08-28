import { axiosInstance } from ".";

export async function getLogedInUser() {
    try {
        const response = await axiosInstance.get("/api/user/me");
        return response.data;
    } catch (error) {
        return error;
    }
}

export async function getAllUsers() {
    try {
        const response = await axiosInstance.get("/api/user/users");
        return response.data;
    } catch (error) {
        return error;
    }
}

export async function uploadProfilePic(image) {
    try {
        const response = await axiosInstance.post("/api/user/profile-pic", { image });
        return response.data;
    } catch (error) {
        return error;
    }
}