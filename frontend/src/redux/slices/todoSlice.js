import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiTodos from '../../api/TodoCalls';

// --- Async Thunks for Todos ---

export const fetchTodos = createAsyncThunk(
    'todos/fetchTodos',
    async (_, { rejectWithValue }) => {
        try {
            const todos = await apiTodos.getTodos();
            return todos;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch todos.');
        }
    }
);

export const createTodoEntry = createAsyncThunk(
    'todos/createTodo',
    async (todoData, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiTodos.createTodo(todoData);
            dispatch(fetchTodos()); // Refresh list to ensure consistency
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create todo.');
        }
    }
);

export const markTodoCompleted = createAsyncThunk(
    'todos/markCompleted',
    async (todoId, { rejectWithValue }) => {
        try {
            const response = await apiTodos.markTodoCompleted(todoId);
            return response; // Returns the updated todo
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to mark todo completed.');
        }
    }
);

export const deleteTodoEntry = createAsyncThunk(
    'todos/deleteTodo',
    async (todoId, { rejectWithValue }) => {
        try {
            await apiTodos.deleteTodo(todoId);
            return todoId; // Return ID on success for reducer
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete todo.');
        }
    }
);

// --- Async Thunks for Repeating Tasks ---

export const fetchRepeatingTasks = createAsyncThunk(
    'todos/fetchRepeatingTasks',
    async (_, { rejectWithValue }) => {
        try {
            const tasks = await apiTodos.getRepeatingTasks();
            return tasks;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch repeating tasks.');
        }
    }
);

export const createRepeatingTaskEntry = createAsyncThunk(
    'todos/createRepeatingTask',
    async (taskData, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiTodos.createRepeatingTask(taskData);
            dispatch(fetchRepeatingTasks()); // Refresh template list
            dispatch(fetchTodos()); // Refresh todo list (for the initial todo created)
            return response.repeatingTask;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create repeating task.');
        }
    }
);

export const toggleRepeatingTaskStatus = createAsyncThunk(
    'todos/toggleRepeatingTaskStatus',
    async (taskId, { rejectWithValue }) => {
        try {
            const response = await apiTodos.toggleRepeatingTask(taskId);
            return response.task; // Returns the updated task
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to toggle repeating task status.');
        }
    }
);

export const deleteRepeatingTaskEntry = createAsyncThunk(
    'todos/deleteRepeatingTask',
    async (taskId, { rejectWithValue }) => {
        try {
            await apiTodos.deleteRepeatingTask(taskId);
            return taskId; // Return ID on success for reducer
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete repeating task.');
        }
    }
);

// --- Slice Definition ---

const todoSlice = createSlice({
    name: 'todo',
    initialState: {
        todos: [],
        repeatingTasks: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        // Reducer to manually update a todo (used for optimistic updates if needed)
        updateTodoLocally: (state, action) => {
            const index = state.todos.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.todos[index] = { ...state.todos[index], ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Todos ---
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

            // --- Mark Todo Completed ---
            .addCase(markTodoCompleted.fulfilled, (state, action) => {
                const updatedTodo = action.payload;
                const index = state.todos.findIndex(t => t._id === updatedTodo._id);
                if (index !== -1) {
                    // Update status to 'completed'
                    state.todos[index] = updatedTodo;
                }
            })

            // --- Delete Todo ---
            .addCase(deleteTodoEntry.fulfilled, (state, action) => {
                state.todos = state.todos.filter(t => t._id !== action.payload);
            })

            // --- Create Repeating Task ---
            .addCase(createRepeatingTaskEntry.fulfilled, (state, action) => {
                state.repeatingTasks.push(action.payload);
            })

            // --- Fetch Repeating Tasks ---
            .addCase(fetchRepeatingTasks.fulfilled, (state, action) => {
                state.repeatingTasks = action.payload;
            })

            // --- Toggle Repeating Task Status ---
            .addCase(toggleRepeatingTaskStatus.fulfilled, (state, action) => {
                const updatedTask = action.payload;
                const index = state.repeatingTasks.findIndex(t => t._id === updatedTask._id);
                if (index !== -1) {
                    state.repeatingTasks[index] = updatedTask;
                }
            })

            // --- Delete Repeating Task ---
            .addCase(deleteRepeatingTaskEntry.fulfilled, (state, action) => {
                state.repeatingTasks = state.repeatingTasks.filter(t => t._id !== action.payload);
            });
    }
});

export const { updateTodoLocally } = todoSlice.actions;
export default todoSlice.reducer;
