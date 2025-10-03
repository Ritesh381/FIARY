import { configureStore } from "@reduxjs/toolkit";
import entryReducer from "./slices/entrySlice";
import streakReducer from "./slices/streakSlice";
import formReducer from "./slices/formSlice";
import userReducer from "./slices/userSlice";
import entryFormReducer from "./slices/entryForm";

const store = configureStore({
  reducer: {
    entry: entryReducer,
    streak: streakReducer,
    forms: formReducer,
    user: userReducer,
    entryForm: entryFormReducer,
  },
});

export default store;
