import apiClient from "./apiClient";
import { setUser } from "../redux/slices/userSlice";

const userApi = {
  getUser: async (dispatch) => {
    try {
      const response = await apiClient.get("/user/me");
      if (response.status === 200) {
        dispatch(setUser(response.data));
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  },

  updateUser: async (data) => {
    const res = await apiClient.put("/user/update", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export default userApi;
