import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [
    { type: "text", content: "Stay consistent 🔥" }
  ],
};

const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    setNavItems: (state, action) => {
      state.items = action.payload;
    },
    clearNavItems: (state) => {
      state.items = [];
    },
  },
});

export const { setNavItems, clearNavItems } = navSlice.actions;
export default navSlice.reducer;
