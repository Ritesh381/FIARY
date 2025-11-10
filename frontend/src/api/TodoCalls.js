import apiClient from "./apiClient";

const apiTodos = {
  getTodos: async () => {
    try {
      const response = await apiClient.get("/todos");
      return response.data;
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  },

  createTodo: async (todoData) => {
    try {
      const response = await apiClient.post("/todos", todoData);
      return response.data;
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  },

  markTodoCompleted: async (id) => {
    try {
      const response = await apiClient.patch(`/todos/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error("Error marking todo completed:", error);
      throw error;
    }
  },

  deleteTodo: async (id) => {
    try {
      await apiClient.delete(`/todos/${id}`);
      return id;
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  },

  getPending: async (date) => {
    try {
      const response = await apiClient.get("/todos/pending");
      return response.data;
    } catch (error) {
      console.error("Error fetching todos by date:", error);
      throw error;
    }
  },

  saveDayTodos: async ({ completed, additions, date }) => {
    try {
      const processedAdditions = additions.map((task) => ({ ...task }));
      const response = await apiClient.post("/todos/batch-save", {
        completed,
        additions: processedAdditions,
        date,
      });
      return response.data;
    } catch (error) {
      console.error("Error saving day todos:", error);
      throw error;
    }
  },

  updateTodo: async ({ id, updates }) => {
    try {
      const response = await apiClient.put(`/todos/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  },
};

export default apiTodos;
