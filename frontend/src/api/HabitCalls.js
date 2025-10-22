import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const apiHabits = {
  // --- HABIT-LEVEL FUNCTIONS ---

  getAllHabits: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/habit`);
      return response.data.habits;
    } catch (error) {
      console.error("Error fetching habits:", error);
      throw error;
    }
  },

  createHabit: async (habitData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/habit`, habitData);
      return response.data;
    } catch (error) {
      console.error("Error creating habit:", error);
      throw error;
    }
  },

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

  // This function is now correct, as the backend controller matches
  getEntriesForHabit: async (habitId, startDate, endDate) => {
    try {
      const response = await axios.post(
        // The controller now expects habitId in the URL
        `${API_BASE_URL}/habit/entry/${habitId}`, 
        { startDate, endDate }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching habit entries:", error);
      throw error;
    }
  },

  // *** NEW FUNCTION ***
  // Replaces createHabitEntries and updateHabitEntry
  // This will create or update a single entry for a given day
  upsertHabitEntry: async (entryData) => {
    // { habitId, date, done, notes }
    try {
      // We'll use a new route for this, POST /habit/entry
      const response = await axios.post(
        `${API_BASE_URL}/habit/entry`,
        entryData
      );
      return response.data;
    } catch (error) {
      console.error("Error upserting habit entry:", error);
      throw error;
    }
  },
};

export default apiHabits;
