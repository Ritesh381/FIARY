import { configureStore } from "@reduxjs/toolkit";
import entryReducer from "./slices/entrySlice";
import streakReducer from "./slices/streakSlice";
import formReducer from "./slices/formSlice";
import userReducer from "./slices/userSlice";

const store = configureStore({
  reducer: {
    entry: entryReducer,
    streak: streakReducer,
    forms: formReducer,
    user: userReducer,
  },
});

export default store;
