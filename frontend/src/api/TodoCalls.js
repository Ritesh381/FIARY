import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const apiTodos = {
  getTodos: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/todos`);
      return response.data;
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  },

  createTodo: async (todoData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/todos`, todoData);
      return response.data;
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  },

  markTodoCompleted: async (id) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/todos/${id}/complete`
      );
      return response.data;
    } catch (error) {
      console.error("Error marking todo completed:", error);
      throw error;
    }
  },


  deleteTodo: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/todos/${id}`);
      return id;
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  },
  
  getPending: async (date) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/todos/pending`
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
      }));
      
      const response = await axios.post(`${API_BASE_URL}/todos/batch-save`, { 
        completed: completed,
        additions: processedAdditions, 
        date
      });
      return response.data;
  },

  updateTodo: async ({ id, updates }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/todos/${id}`,
        updates
      );
      return response.data;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  }
};

export default apiTodos;