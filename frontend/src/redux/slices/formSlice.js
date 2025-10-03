import { createSlice } from "@reduxjs/toolkit";

const today = new Date();
today.setDate(today.getDate() - 1);

export const formSlice = createSlice({
  name: "forms",
  initialState: {
    date: today.toISOString().split("T")[0],
    saveForm: false,
    editForm: false,
  },
  reducers: {
    setDate: (state, action) => { 
      state.date = action.payload; 
    },
    toggleSaveForm: (state) => { 
      state.saveForm = !state.saveForm; 
    },
    toggleEditForm: (state) => { 
      state.editForm = !state.editForm; 
    },
  },
});

export const { setDate, toggleSaveForm, toggleEditForm } = formSlice.actions;

export default formSlice.reducer;