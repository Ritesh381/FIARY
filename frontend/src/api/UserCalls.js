import axios from "axios";
import { setUser } from "../redux/slices/userSlice";

axios.defaults.withCredentials = true;
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = {
    getUserById: async (id, dispatch) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/${id}`);
            if (response.status === 200) {
                dispatch(setUser(response.data.user));
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }
}

export default api;
