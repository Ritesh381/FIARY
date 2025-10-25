import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiFinance from "../../api/FinanceCalls";

// --- Async Thunks ---

export const fetchFinanceEntries = createAsyncThunk(
    'finance/fetchFinanceEntries',
    async (_, { rejectWithValue }) => {
        try {
            const data = await apiFinance.getAllFinance();
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch finance entries.');
        }
    }
);

export const createFinanceEntry = createAsyncThunk(
    'finance/createFinanceEntry',
    async (newEntry, { rejectWithValue }) => {
        try {
            const data = await apiFinance.createFinance(newEntry);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create finance entry.');
        }
    }
);

export const updateFinanceEntry = createAsyncThunk(
    'finance/updateFinanceEntry',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const data = await apiFinance.updateFinance(id, updatedData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update finance entry.');
        }
    }
);

export const deleteFinanceEntry = createAsyncThunk(
    'finance/deleteFinanceEntry',
    async (id, { rejectWithValue }) => {
        try {
            await apiFinance.deleteFinance(id);
            return id; // Return the ID of the deleted entry
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete finance entry.');
        }
    }
);

// We assume there are API calls to fetch categories, which is essential for the form
export const fetchCategoriesAndSubcategories = createAsyncThunk(
    'finance/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            // Assuming this API call fetches all categories and their subcategories
            const data = await apiFinance.getAllCategories(); 
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch categories.');
        }
    }
);


// --- Slice Definition ---

const financeSlice = createSlice({
    name: 'finance',
    initialState: {
        entries: [],
        categories: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
        // UI State for modals
        isAddModalOpen: false,
        isEditModalOpen: false,
        selectedEntry: null,
    },
    reducers: {
        // Reducers for UI control
        toggleAddModal: (state) => {
            state.isAddModalOpen = !state.isAddModalOpen;
        },
        openEditModal: (state, action) => {
            state.selectedEntry = action.payload; // Set entry data for editing
            state.isEditModalOpen = true;
        },
        closeEditModal: (state) => {
            state.isEditModalOpen = false;
            state.selectedEntry = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Entries
            .addCase(fetchFinanceEntries.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchFinanceEntries.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.entries = action.payload;
            })
            .addCase(fetchFinanceEntries.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // Fetch Categories
            .addCase(fetchCategoriesAndSubcategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            
            // Create Entry
            .addCase(createFinanceEntry.fulfilled, (state, action) => {
                state.entries.unshift(action.payload); // Add new entry to the start
            })

            // Update Entry
            .addCase(updateFinanceEntry.fulfilled, (state, action) => {
                const index = state.entries.findIndex(e => e._id === action.payload._id);
                if (index !== -1) {
                    state.entries[index] = action.payload;
                }
            })

            // Delete Entry
            .addCase(deleteFinanceEntry.fulfilled, (state, action) => {
                state.entries = state.entries.filter(e => e._id !== action.payload);
            });
    },
});

export const { toggleAddModal, openEditModal, closeEditModal } = financeSlice.actions;

export default financeSlice.reducer;
