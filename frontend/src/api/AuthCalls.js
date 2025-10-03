import axios from "axios";
import { setUser, logout } from "../redux/slices/userSlice";

axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = {
  signIn: async (credentials, dispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, credentials);
      localStorage.setItem("userId", response.data.user._id);
      if (response.status === 200) {
        dispatch(setUser(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  },

  signUp: async (userData, dispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      localStorage.setItem("userId", response.data.user._id);
      if (response.status === 200) {
        dispatch(setUser(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  },

  signOut: async (dispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/logout`);
      localStorage.removeItem("userId");
      dispatch(logout());
      return response.data;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },
  checkAuth: async (dispatch) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/checkauth`);
      if (response.status === 200 && response.data.user) {
        dispatch(setUser(response.data.user));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      dispatch(logout());
      return false;
    }
  },
};

export default api;
