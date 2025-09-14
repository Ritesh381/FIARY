import { createSlice } from "@reduxjs/toolkit";

export const streakSlice = createSlice({
  name: "streak",
  initialState: { value: 0, message: "Start your streak" },
  reducers: {
    setStreak: (state, action) => {
      state.value = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload
    }
  },
});

export const { setStreak, setMessage } = streakSlice.actions;

export default streakSlice.reducer;