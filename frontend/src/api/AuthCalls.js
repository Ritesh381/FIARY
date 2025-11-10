import apiClient from "./apiClient";
import { setUser, logout } from "../redux/slices/userSlice";

const api = {
  signIn: async (credentials, dispatch) => {
    try {
      const response = await apiClient.post("/auth/signin", credentials);
      localStorage.setItem("userId", response.data.user.id);
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
      const response = await apiClient.post("/auth/signup", userData);
      localStorage.setItem("userId", response.data.user.id);
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
      const response = await apiClient.post("/auth/logout");
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
      const response = await apiClient.get("/auth/checkauth");
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
