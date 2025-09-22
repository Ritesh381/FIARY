import axios from "axios";

// This is the crucial line. It tells Axios to send cookies with all requests.
axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = {
  // Function to save a new journal entry
  saveEntry: async (entryData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/entry/save`,
        entryData
      );
      return response.data;
    } catch (error) {
      console.error("Error saving entry:", error);
      throw error;
    }
  },

  // Function to fetch all journal entries
  getAllEntries: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/entry`);
      return response.data.entries;
    } catch (error) {
      console.error("Error fetching entries:", error);
      throw error;
    }
  },

  // Function to update an existing journal entry
  updateEntry: async (id, updatedData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/entry/edit/${id}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating entry:", error);
      throw error;
    }
  },

  // Function to delete a journal entry by its ID
  deleteEntry: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/entry/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }
  },
  dailyInsights: async (id) => {
    try{
      const response = await axios.post(`${API_BASE_URL}/ai/one/${id}`)
      return response.data;
    }catch (error){
      console.error("Error generating daily ai insight:", error);
      throw error;
    }
  },
  weeklyInsights: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/week`);
      return response.data;
    } catch (error) {
      console.error("Error generating weekly ai insights:", error);
      throw error;
    }
  },
};

export default api;
