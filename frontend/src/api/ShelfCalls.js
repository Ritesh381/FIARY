import apiClient from "./apiClient";

const shelfApi = {
  getShelves: async () => {
    try {
      const res = await apiClient.get("/shelf");
      return res.data;
    } catch (error) {
      console.error("Error fetching shelves:", error);
      throw error;
    }
  },

  createShelf: async (data) => {
    try {
      const res = await apiClient.post("/shelf", data);
      return res.data;
    } catch (error) {
      console.error("Error creating shelf:", error);
      throw error;
    }
  },

  updateShelf: async (shelfId, data) => {
    try {
      const res = await apiClient.put(`/shelf/${shelfId}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating shelf:", error);
      throw error;
    }
  },

  deleteShelf: async (shelfId) => {
    try {
      const res = await apiClient.delete(`/shelf/${shelfId}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting shelf:", error);
      throw error;
    }
  },

  getItemsByShelf: async (shelfId) => {
    try {
      const res = await apiClient.get(`/shelfitem/shelf/${shelfId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching shelf items:", error);
      throw error;
    }
  },

  getItemById: async (itemId) => {
    try {
      const res = await apiClient.get(`/shelfitem/${itemId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching shelf item:", error);
      throw error;
    }
  },

  createItem: async (data) => {
    try {
      const res = await apiClient.post("/shelfitem", data);
      return res.data;
    } catch (error) {
      console.error("Error creating shelf item:", error);
      throw error;
    }
  },

  updateItem: async (itemId, data) => {
    try {
      const res = await apiClient.put(`/shelfitem/${itemId}`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating shelf item:", error);
      throw error;
    }
  },

  deleteItem: async (itemId) => {
    try {
      const res = await apiClient.delete(`/shelfitem/${itemId}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting shelf item:", error);
      throw error;
    }
  },

  searchItems: async (query) => {
    try {
      const res = await apiClient.get("/shelfitem/search", {
        params: { query },
      });
      return res.data;
    } catch (error) {
      console.error("Error searching shelf items:", error);
      throw error;
    }
  },
};

export default shelfApi;
