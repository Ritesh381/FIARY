import axios from "axios";

axios.defaults.withCredentials = true;
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const apiMemories = {
  getAllMemories: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/memories`);
      return response.data;
    } catch (error) {
      console.error("Error fetching memories:", error);
      throw error;
    }
  },

  createMemory: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/memories`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating memory:", error);
      throw error;
    }
  },

  updateMemory: async (id, formData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/memories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating memory:", error);
      throw error;
    }
  },

  deleteMemory: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/memories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting memory:", error);
      throw error;
    }
  },
};

export default apiMemories;
