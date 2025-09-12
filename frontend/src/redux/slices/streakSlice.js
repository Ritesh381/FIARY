import { createSlice } from "@reduxjs/toolkit";

export const streakSlice = createSlice({
  name: "streak",
  initialState: { value: 0 },
  reducers: {
    setStreak: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setStreak } = streakSlice.actions;

export default streakSlice.reducer;