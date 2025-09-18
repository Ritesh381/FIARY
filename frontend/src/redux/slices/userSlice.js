import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loggedIn: false,
  token: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loggedIn = true;
    },
    logout: (state, action) => {
      state.user = null;
      state.loggedIn = false;
    },
  },
});

export default userSlice.reducer;
export const { setUser, logout } = userSlice.actions;
