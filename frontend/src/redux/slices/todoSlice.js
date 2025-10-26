import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiTodo from '../../api/TodoCalls'; // Assuming path

// --- ASYNC THUNKS (Simplified for slice definition) ---

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

export const fetchRepeatingTasks = createAsyncThunk(
    'todo/fetchRepeatingTasks',
    async (_, { rejectWithValue }) => {
        try {
            const tasks = await apiTodo.getRepeatingTasks();
            return tasks;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch repeating tasks.');
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

// (Placeholder thunks used by TaskEditModal)
export const updateTodoEntry = createAsyncThunk('todo/updateTodoEntry', async ({ id, updates }) => { /* ... */ });
export const deleteTodoEntry = createAsyncThunk('todo/deleteTodoEntry', async (id) => { /* ... */ });
export const updateRepeatingTaskEntry = createAsyncThunk('todo/updateRepeatingTaskEntry', async ({ id, updates }) => { /* ... */ });
export const deleteRepeatingTaskEntry = createAsyncThunk('todo/deleteRepeatingTaskEntry', async (id) => { /* ... */ });
export const toggleRepeatingTaskStatus = createAsyncThunk('todo/toggleRepeatingTaskStatus', async (id) => { /* ... */ });
export const createTodoEntry = createAsyncThunk('todo/createTodoEntry', async (data) => { /* ... */ });
export const createRepeatingTaskEntry = createAsyncThunk('todo/createRepeatingTaskEntry', async (data) => { /* ... */ });


// --- SLICE DEFINITION ---

const initialState = {
    todos: [],
    repeatingTasks: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    
    // UI Modal States (NEW ADDITIONS)
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
            
            // Fetch Repeating Tasks
            .addCase(fetchRepeatingTasks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchRepeatingTasks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.repeatingTasks = action.payload;
            })
            .addCase(fetchRepeatingTasks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
            
            // Add case for other thunks if required (e.g., refreshing state after update)
    }
});

// Export all actions, including the new modal controls
export const { 
    toggleFormModal, 
    openEditModal, 
    closeEditModal
} = todoSlice.actions;

export default todoSlice.reducer;
