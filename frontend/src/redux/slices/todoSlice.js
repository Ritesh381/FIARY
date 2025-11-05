import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiTodo from '../../api/TodoCalls';

export const fetchTodos = createAsyncThunk(
    'todo/fetchTodos',
    async (_, { rejectWithValue }) => {
        try {
            const todos = await apiTodo.getTodos();
            return todos;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch todos.');
        }
    }
);

export const createTodoEntry = createAsyncThunk(
    'todo/createTodoEntry',
    async (todoData, { dispatch, rejectWithValue }) => {
        try {
            const newTodo = await apiTodo.createTodo(todoData);
            dispatch(fetchTodos());
            return newTodo;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create todo.');
        }
    }
);

export const updateTodoEntry = createAsyncThunk(
    'todo/updateTodoEntry', 
    async ({ id, updates }, { dispatch, rejectWithValue }) => {
        try {
            const updatedTodo = await apiTodo.updateTodo({ id, updates }); // Using updated API function
            dispatch(fetchTodos());
            return updatedTodo;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update todo.');
        }
    }
);

export const deleteTodoEntry = createAsyncThunk(
    'todo/deleteTodoEntry', 
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await apiTodo.deleteTodo(id); 
            dispatch(fetchTodos()); // Refresh list
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete todo.');
        }
    }
);

export const markTodoCompleted = createAsyncThunk(
    'todo/markTodoCompleted',
    async (todoId, { dispatch, rejectWithValue }) => {
        try {
            await apiTodo.markTodoCompleted(todoId);
            dispatch(fetchTodos()); // Refresh list after completion
            return todoId;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to mark task complete.');
        }
    }
);

const initialState = {
    todos: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    
    // UI Modal States
    isFormModalOpen: false, 
    isEditModalOpen: false,
    selectedTask: null, // Holds data for the task being edited
};

const todoSlice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        // Toggle the visibility of the new task creation modal
        toggleFormModal: (state, action) => {
            state.isFormModalOpen = action.payload;
            if (action.payload === false) {
                 state.selectedTask = null;
            }
        },
        // Open the edit modal and set the task to be edited
        openEditModal: (state, action) => {
            state.selectedTask = action.payload;
            state.isEditModalOpen = true;
        },
        // Close the edit modal and clear the selected task
        closeEditModal: (state) => {
            state.selectedTask = null;
            state.isEditModalOpen = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Todos
            .addCase(fetchTodos.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.todos = action.payload;
            })
            .addCase(fetchTodos.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // Optimistic update for completion (full list refresh will confirm)
            .addCase(markTodoCompleted.fulfilled, (state, action) => {
                const index = state.todos.findIndex(todo => todo._id === action.payload);
                if (index !== -1) {
                    state.todos[index].status = 'completed';
                }
            });
            
            // Removed: Fetch Repeating Tasks cases
    }
});

// Export all actions, including the new modal controls
export const { 
    toggleFormModal, 
    openEditModal, 
    closeEditModal
} = todoSlice.actions;

export default todoSlice.reducer;
