import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiMemories from '../../api/MemoryCalls';

export const fetchMemories = createAsyncThunk(
  'memories/fetchMemories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiMemories.getAllMemories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch memories');
    }
  }
);

export const createMemory = createAsyncThunk(
  'memories/createMemory',
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiMemories.createMemory(formData);
      dispatch(fetchMemories());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create memory');
    }
  }
);

export const updateMemory = createAsyncThunk(
  'memories/updateMemory',
  async ({ id, formData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiMemories.updateMemory(id, formData);
      dispatch(fetchMemories());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update memory');
    }
  }
);

export const deleteMemory = createAsyncThunk(
  'memories/deleteMemory',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await apiMemories.deleteMemory(id);
      dispatch(fetchMemories());
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete memory');
    }
  }
);

const memoriesSlice = createSlice({
  name: 'memories',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    isAddModalOpen: false,
    isEditModalOpen: false,
    selectedMemory: null,
  },
  reducers: {
    toggleAddModal: (state) => {
      state.isAddModalOpen = !state.isAddModalOpen;
    },
    toggleEditModal: (state, action) => {
      state.isEditModalOpen = !state.isEditModalOpen;
      state.selectedMemory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMemories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMemories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { toggleAddModal, toggleEditModal } = memoriesSlice.actions;
export default memoriesSlice.reducer;
