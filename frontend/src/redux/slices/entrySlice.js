import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  entries: [],
};

export const entrySlice = createSlice({
  name: "entries",
  initialState,
  reducers: {
    setEntries: (state, action) => {
      state.entries = action.payload;
    },
    addEntry: (state, action) => {
      state.entries.push(action.payload);
    },
    editEntry: (state, action) => {
      const { id, updatedEntry } = action.payload;
      const index = state.entries.findIndex((entry) => entry._id === id);
      if (index !== -1) {
        state.entries[index] = updatedEntry;
      }
    },
    deleteEntry: (state, action) => {
      state.entries = state.entries.filter((entry) => entry._id !== action.payload);
    },
  },
});

export const { setEntries, addEntry, editEntry, deleteEntry } = entrySlice.actions;

export default entrySlice.reducer;