import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const apiHabits = {
  // --- HABIT-LEVEL FUNCTIONS ---

  // Function to fetch all of a user's habits
  getAllHabits: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/habit`);
      return response.data.habits;
    } catch (error) {
      console.error("Error fetching habits:", error);
      throw error;
    }
  },

  // Function to create a new habit
  createHabit: async (habitData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/habit`, habitData);
      return response.data;
    } catch (error) {
      console.error("Error creating habit:", error);
      throw error;
    }
  },

  // Function to update an existing habit
  updateHabit: async (id, updatedData) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/habit/${id}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating habit:", error);
      throw error;
    }
  },

  // Function to delete (archive) a habit by its ID
  deleteHabit: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/habit/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting habit:", error);
      throw error;
    }
  },

  // --- HABIT ENTRY-LEVEL FUNCTIONS ---

  // Function to get all entries for a single habit within a date range
  getEntriesForHabit: async (habitId, startDate, endDate) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/habit/entry/${habitId}`,
        { startDate, endDate }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching habit entries:", error);
      throw error;
    }
  },

  // Function to create multiple habit entries at once
  createHabitEntries: async (entriesData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/habit/entry`,
        entriesData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating bulk entries:", error);
      throw error;
    }
  },

  // Function to update multiple habit entries at once
  updateHabitEntry: async (habitId, entryData) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/habit/entry/${habitId}`,
        entryData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating entry: ", error);
      throw error;
    }
  },
};

export default apiHabits;

