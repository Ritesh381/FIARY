import axios from "axios";
import { setUser } from "../redux/slices/userSlice";

axios.defaults.withCredentials = true;
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const userApi = {
    getUser: async (dispatch) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/me`);
            if (response.status === 200) {
                dispatch(setUser(response.data));
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    },
    updateUser: async (data) => {
        const res = await axios.put(`${API_BASE_URL}/user/update`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },
}

export default userApi;
