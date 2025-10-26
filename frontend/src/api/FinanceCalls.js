import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const apiFinance = {
  // Function to fetch all finance entries for the user
  getAllFinance: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finance`);
      return response.data;
    } catch (error) {
      console.error("Error fetching finance entries:", error);
      throw error;
    }
  },

  // Function to fetch all categories and their subcategories
  getFinanceCategories: async () => {
    try {
      // Hitting the new router endpoint: /api/fincat
      const response = await axios.get(`${API_BASE_URL}/fincat`);
      return response.data;
    } catch (error) {
      console.error("Error fetching finance categories:", error);
      throw error;
    }
  },

  // Function to create a new finance entry
  createFinance: async (entryData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/finance`, entryData);
      return response.data;
    } catch (error) {
      console.error("Error creating finance entry:", error);
      throw error;
    }
  },

  // Function to update an existing finance entry
  updateFinance: async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/finance/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating finance entry:", error);
      throw error;
    }
  },

  // Function to delete a finance entry
  deleteFinance: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/finance/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting finance entry:", error);
      throw error;
    }
  },
  
  // --- NEW CATEGORY/SUBCATEGORY CRUD FUNCTIONS ---

  // Category CRUD
  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/fincat`, categoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/fincat/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },
  
  deleteCategory: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/fincat/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // SubCategory CRUD
  createSubCategory: async (subCategoryData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/fincat/sub`, subCategoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },
  
  updateSubCategory: async (id, subCategoryData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/fincat/sub/${id}`, subCategoryData);
      return response.data;
    } catch (error) {
      console.error("Error updating subcategory:", error);
      throw error;
    }
  },
  
  deleteSubCategory: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/fincat/sub/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw error;
    }
  },
};

export default apiFinance;
