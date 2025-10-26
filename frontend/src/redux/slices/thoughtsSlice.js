import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiThoughts from '../../api/ThoughtsCalls';

// --- ASYNC THUNKS ---

export const fetchAllThoughts = createAsyncThunk(
    'thoughts/fetchAllThoughts',
    async (_, { rejectWithValue }) => {
        try {
            const thoughts = await apiThoughts.getAllThoughts();
            return thoughts;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch thoughts.');
        }
    }
);

export const createThought = createAsyncThunk(
    'thoughts/createThought',
    async (thoughtData, { rejectWithValue, dispatch }) => {
        try {
            const newThought = await apiThoughts.createThought(thoughtData);
            dispatch(fetchAllThoughts()); // Refresh list
            return newThought;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create thought.');
        }
    }
);

export const updateThought = createAsyncThunk(
    'thoughts/updateThought',
    async ({ id, updates }, { rejectWithValue, dispatch }) => {
        try {
            const updatedThought = await apiThoughts.updateThought(id, updates);
            dispatch(fetchAllThoughts()); // Refresh list
            return updatedThought;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update thought.');
        }
    }
);

export const deleteThought = createAsyncThunk(
    'thoughts/deleteThought',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            await apiThoughts.deleteThought(id);
            dispatch(fetchAllThoughts()); // Refresh list
            return id;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete thought.');
        }
    }
);


// --- SLICE DEFINITION ---

const initialState = {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const thoughtsSlice = createSlice({
    name: 'thoughts',
    initialState,
    reducers: {
        // Reducers for optimistic/local updates can be added here if needed
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAllThoughts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllThoughts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchAllThoughts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
            // Other cases for CRUD are handled by refreshing the list via fetchAllThoughts
    }
});

export default thoughtsSlice.reducer;
