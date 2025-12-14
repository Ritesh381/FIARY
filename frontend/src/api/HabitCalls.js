import apiClient from "./apiClient";

const apiHabits = {
  getAllHabits: async () => {
    try {
      const response = await apiClient.get("/habit");
      return response.data.habits;
    } catch (error) {
      console.error("Error fetching habits:", error);
      throw error;
    }
  },

  createHabit: async (habitData) => {
    try {
      const response = await apiClient.post("/habit", habitData);
      return response.data;
    } catch (error) {
      console.error("Error creating habit:", error);
      throw error;
    }
  },

  updateHabit: async (id, updatedData) => {
    try {
      const response = await apiClient.patch(`/habit/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating habit:", error);
      throw error;
    }
  },

  deleteHabit: async (id) => {
    try {
      const response = await apiClient.delete(`/habit/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting habit:", error);
      throw error;
    }
  },

  getEntriesForHabit: async (habitId, startDate, endDate) => {
    try {
      const response = await apiClient.post(`/habit/entry/${habitId}`, {
        startDate,
        endDate,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching habit entries:", error);
      throw error;
    }
  },

  upsertHabitEntry: async (entryData) => {
    try {
      const response = await apiClient.post("/habit/entry", entryData);
      return response.data;
    } catch (error) {
      console.error("Error upserting habit entry:", error);
      throw error;
    }
  },

  deleteHabitEntry: async (habitId, date) => {
    try {
      const response = await apiClient.delete("/habit/entry", {
        data: { habitId, date }
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting habit entry:", error);
      throw error;
    }
  },

  getTodaysEntries: async (date) => {
    try {
      const response = await apiClient.get("/habit/entry/bydate", {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching today's habit entries:", error);
      throw error;
    }
  },
};

export default apiHabits;
