import apiClient from "./apiClient";

const api = {
  saveEntry: async (entryData) => {
    try {
      const response = await apiClient.post("/entry/save", entryData);
      return response.data;
    } catch (error) {
      console.error("Error saving entry:", error);
      throw error;
    }
  },

  getAllEntries: async () => {
    try {
      const response = await apiClient.get("/entry");
      return response.data.entries;
    } catch (error) {
      console.error("Error fetching entries:", error);
      throw error;
    }
  },

  updateEntry: async (id, updatedData) => {
    try {
      const response = await apiClient.post(`/entry/edit/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating entry:", error);
      throw error;
    }
  },

  deleteEntry: async (id) => {
    try {
      const response = await apiClient.delete(`/entry/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }
  },

  dailyInsights: async (id) => {
    try {
      const response = await apiClient.post(`/ai/one/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error generating daily ai insight:", error);
      throw error;
    }
  },

  weeklyInsights: async () => {
    try {
      const response = await apiClient.get("/ai/week");
      return response.data;
    } catch (error) {
      console.error("Error generating weekly ai insights:", error);
      throw error;
    }
  },

  monthlyInsights: async () => {
    try {
      const response = await apiClient.get("/ai/month");
      return response.data;
    } catch (error) {
      console.error("Error generating monthly ai insights:", error);
      throw error;
    }
  },

  getOneEntry: async (id) => {
    try {
      const response = await apiClient.get(`/entry/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching single entry:", error);
      throw error;
    }
  },
};

export default api;
