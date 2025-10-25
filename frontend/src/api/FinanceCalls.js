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

  // Function to create a new finance entry (POST /finance)
  createFinance: async (entryData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/finance`, entryData);
      return response.data;
    } catch (error) {
      console.error("Error creating finance entry:", error);
      throw error;
    }
  },
  
  // Function to update an existing finance entry (PUT /finance/:id)
  updateFinance: async (id, updatedData) => {
    try {
        // Assuming backend uses PUT /:id for updates based on Finance.routes.js
        const response = await axios.put(`${API_BASE_URL}/finance/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Error updating finance entry:", error);
        throw error;
    }
  },

  // Function to delete a finance entry (DELETE /finance/:id)
  deleteFinance: async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/finance/${id}`);
        return response.data; // Should return { message: "Finance entry deleted successfully" }
    } catch (error) {
        console.error("Error deleting finance entry:", error);
        throw error;
    }
  },

  // Function to fetch all categories and subcategories
  // NOTE: Assuming a dedicated backend route for categories, e.g., /api/finance/categories
  getAllCategories: async () => {
    try {
        // Placeholder API route: You may need to confirm this path with backend developer
        const response = await axios.get(`${API_BASE_URL}/finance/categories`);
        // Assuming response.data is an array like: 
        // [{_id: "...", name: "Food", subcategories: [...]}, ...]
        return response.data; 
    } catch (error) {
        console.error("Error fetching categories:", error);
        // Return dummy data for frontend development if API is missing
        return [
            { _id: 'cat1', name: 'Food', isGlobal: true, subcategories: [{ _id: 'sub1', name: 'Groceries' }, { _id: 'sub2', name: 'Restaurants' }] },
            { _id: 'cat2', name: 'Income', isGlobal: true, subcategories: [{ _id: 'sub3', name: 'Salary' }, { _id: 'sub4', name: 'Freelance' }] },
            { _id: 'cat3', name: 'Housing', isGlobal: true, subcategories: [{ _id: 'sub5', name: 'Rent' }, { _id: 'sub6', name: 'Utilities' }] },
        ];
    }
  }
};

export default apiFinance;
