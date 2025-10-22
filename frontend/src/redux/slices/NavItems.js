import { createSlice } from "@reduxjs/toolkit";

export const navItemsSlice = createSlice({
  name: "streak",
  initialState: [{ type:"msg", label:"Consistency is the key to success" }],
  reducers: {
    addItem: (state, action) => {
        state.push(action.payload)
    },
    setArr : (state, action) => {
        state = action.payload
    }
  },
});

export const { setStreak, setMessage } = navItemsSlice.actions;

export default navItemsSlice.reducer;