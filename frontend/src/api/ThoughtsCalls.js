import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const apiThoughts = {
  // Function to fetch all thoughts for the user
  getAllThoughts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/thoughts`);
      return response.data;
    } catch (error) {
      console.error("Error fetching thoughts:", error);
      throw error;
    }
  },

  // Function to create a new thought
  createThought: async (thoughtData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/thoughts`, thoughtData);
      return response.data;
    } catch (error) {
      console.error("Error creating thought:", error);
      throw error;
    }
  },

  // Function to update an existing thought
  updateThought: async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/thoughts/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating thought:", error);
      throw error;
    }
  },

  // Function to delete a thought
  deleteThought: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/thoughts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting thought:", error);
      throw error;
    }
  },
};

export default apiThoughts;
