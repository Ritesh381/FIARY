import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getToken = () => localStorage.getItem('authToken');

export const fetchHabits = createAsyncThunk(
    'habits/fetchHabits',
    async (_, { rejectWithValue }) => {
        try {
            const token = getToken();
            const response = await fetch('/api/habit', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch habits.');
            }
            const data = await response.json();
            return data.habits;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createHabit = createAsyncThunk(
    'habits/createHabit',
    async (habitData, { rejectWithValue }) => {
        try {
            const token = getToken();
            const response = await fetch('/api/habit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(habitData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to create habit.');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateHabit = createAsyncThunk(
    'habits/updateHabit',
    async ({ id, ...habitData }, { rejectWithValue }) => {
        try {
            const token = getToken();
            const response = await fetch(`/api/habit/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(habitData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update habit.');
            }
            const { entry } = await response.json();
            return entry;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteHabit = createAsyncThunk(
    'habits/deleteHabit',
    async (habitId, { rejectWithValue }) => {
        try {
            const token = getToken();
            const response = await fetch(`/api/habit/${habitId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to delete habit.');
            }
            return habitId; // Return the ID on success
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// --- SLICE DEFINITION ---

const habitsSlice = createSlice({
    name: 'habits',
    initialState: {
        items: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Habits
            .addCase(fetchHabits.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchHabits.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchHabits.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Create Habit
            .addCase(createHabit.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update Habit
            .addCase(updateHabit.fulfilled, (state, action) => {
                const index = state.items.findIndex(habit => habit._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete Habit
            .addCase(deleteHabit.fulfilled, (state, action) => {
                state.items = state.items.filter(habit => habit._id !== action.payload);
            });
    }
});

export default habitsSlice.reducer;
