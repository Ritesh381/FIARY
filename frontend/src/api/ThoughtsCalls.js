import apiClient from "./apiClient";

const apiThoughts = {
  getAllThoughts: async () => {
    try {
      const response = await apiClient.get("/thoughts");
      return response.data;
    } catch (error) {
      console.error("Error fetching thoughts:", error);
      throw error;
    }
  },

  createThought: async (thoughtData) => {
    try {
      const response = await apiClient.post("/thoughts", thoughtData);
      return response.data;
    } catch (error) {
      console.error("Error creating thought:", error);
      throw error;
    }
  },

  updateThought: async (id, updatedData) => {
    try {
      const response = await apiClient.put(`/thoughts/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating thought:", error);
      throw error;
    }
  },

  deleteThought: async (id) => {
    try {
      const response = await apiClient.delete(`/thoughts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting thought:", error);
      throw error;
    }
  },
};

export default apiThoughts;
