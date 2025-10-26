import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const apiTodos = {
  // --- TODOS (One-time Tasks) ---

  getTodos: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/todos`);
      return response.data; // Array of Todo objects
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  },

  createTodo: async (todoData) => {
    // Used for creating a one-time todo (will not use repeating-task endpoint)
    try {
      const response = await axios.post(`${API_BASE_URL}/todos`, todoData);
      return response.data; // New Todo object
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  },

  markTodoCompleted: async (id) => {
    try {
      // Uses the PATCH /:id/complete route
      const response = await axios.patch(
        `${API_BASE_URL}/todos/${id}/complete`
      );
      return response.data; // Updated Todo object
    } catch (error) {
      console.error("Error marking todo completed:", error);
      throw error;
    }
  },

  deleteTodo: async (id) => {
    try {
      // Uses the DELETE /:id route (soft delete)
      await axios.delete(`${API_BASE_URL}/todos/${id}`);
      return id;
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  },

  // --- REPEATING TASKS (Templates) ---

  getRepeatingTasks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/repeating-tasks`);
      return response.data; // Array of RepeatingTask objects
    } catch (error) {
      console.error("Error fetching repeating tasks:", error);
      throw error;
    }
  },

  createRepeatingTask: async (taskData) => {
    // Used for creating a new RepeatingTask template (which automatically creates the first Todo)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/repeating-tasks`,
        taskData
      );
      // Returns { repeatingTask, firstTodo }
      return response.data;
    } catch (error) {
      console.error("Error creating repeating task:", error);
      throw error;
    }
  },

  toggleRepeatingTask: async (id) => {
    try {
      // Uses the PATCH /:id/toggle route
      const response = await axios.patch(
        `${API_BASE_URL}/repeating-tasks/${id}/toggle`
      );
      return response.data; // Returns { message, task }
    } catch (error) {
      console.error("Error toggling repeating task status:", error);
      throw error;
    }
  },

  deleteRepeatingTask: async (id) => {
    try {
      // Uses the DELETE /:id route
      await axios.delete(`${API_BASE_URL}/repeating-tasks/${id}`);
      return id;
    } catch (error) {
      console.error("Error deleting repeating task:", error);
      throw error;
    }
  },
  getTodosByDate: async (date) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/todos/by-date?date=${date}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching todos by date:", error);
      throw error;
    }
  },
  saveDayTodos: async ({ completed, additions, date }) => {
      const processedAdditions = additions.map(task => ({
          ...task,
          frequency: 'daily',
      }));
      
      console.log(`API call simulation: Saving ${completed.length} completions and ${processedAdditions.length} new tasks for ${date}`);
      
      const response = await axios.post(`${API_BASE_URL}/todos/batch-save`, { 
        completed: completed.map(t => t._id),
        additions: processedAdditions, 
        date 
      });
      return response.data;
  },
};

export default apiTodos;
