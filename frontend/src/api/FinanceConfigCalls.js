import apiClient from "./apiClient";

const apiFinanceConfig = {
  // Category Operations
  getAllCategories: async () => {
    try {
      const response = await apiClient.get("/fincat");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      // Default isExpense to true if not provided
      const data = {
        name: categoryData.name,
        isExpense: categoryData.isExpense ?? true,
      };
      const response = await apiClient.post("/fincat", data);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await apiClient.patch(`/fincat/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      const response = await apiClient.delete(`/fincat/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // SubCategory Operations
  createSubCategory: async (subCategoryData) => {
    try {
      const data = {
        name: subCategoryData.name,
        categoryId: subCategoryData.category_id || subCategoryData.categoryId,
      };
      const response = await apiClient.post("/fincat/sub", data);
      return response.data;
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },

  updateSubCategory: async (subCategoryId, subCategoryData) => {
    try {
      const response = await apiClient.patch(`/fincat/sub/${subCategoryId}`, subCategoryData);
      return response.data;
    } catch (error) {
      console.error("Error updating subcategory:", error);
      throw error;
    }
  },

  deleteSubCategory: async (subCategoryId) => {
    try {
      const response = await apiClient.delete(`/fincat/sub/${subCategoryId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw error;
    }
  },
};

export default apiFinanceConfig;
