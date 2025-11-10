import apiClient from "./apiClient";

const apiFinance = {
  getAllFinance: async () => {
    try {
      const response = await apiClient.get("/finance");
      return response.data;
    } catch (error) {
      console.error("Error fetching finance entries:", error);
      throw error;
    }
  },

  getFinanceCategories: async () => {
    try {
      const response = await apiClient.get("/fincat");
      return response.data;
    } catch (error) {
      console.error("Error fetching finance categories:", error);
      throw error;
    }
  },

  createFinance: async (entryData) => {
    try {
      const response = await apiClient.post("/finance", entryData);
      return response.data;
    } catch (error) {
      console.error("Error creating finance entry:", error);
      throw error;
    }
  },

  updateFinance: async (id, updatedData) => {
    try {
      const response = await apiClient.put(`/finance/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating finance entry:", error);
      throw error;
    }
  },

  deleteFinance: async (id) => {
    try {
      const response = await apiClient.delete(`/finance/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting finance entry:", error);
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post("/fincat", categoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiClient.patch(`/fincat/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/fincat/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  createSubCategory: async (subCategoryData) => {
    try {
      const response = await apiClient.post("/fincat/sub", subCategoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },

  updateSubCategory: async (id, subCategoryData) => {
    try {
      const response = await apiClient.patch(`/fincat/sub/${id}`, subCategoryData);
      return response.data;
    } catch (error) {
      console.error("Error updating subcategory:", error);
      throw error;
    }
  },

  deleteSubCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/fincat/sub/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw error;
    }
  },
};

export default apiFinance;
