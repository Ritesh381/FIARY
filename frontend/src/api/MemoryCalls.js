import apiClient from "./apiClient";

const apiMemories = {
  getAllMemories: async () => {
    try {
      const response = await apiClient.get("/memories");
      return response.data;
    } catch (error) {
      console.error("Error fetching memories:", error);
      throw error;
    }
  },

  createMemory: async (formData) => {
    try {
      const response = await apiClient.post("/memories", formData, {
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
      const response = await apiClient.put(`/memories/${id}`, formData, {
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
      const response = await apiClient.delete(`/memories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting memory:", error);
      throw error;
    }
  },
};

export default apiMemories;
