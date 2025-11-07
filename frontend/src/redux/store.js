import { configureStore } from "@reduxjs/toolkit";
import entryReducer from "./slices/entrySlice";
import streakReducer from "./slices/streakSlice";
import formReducer from "./slices/formSlice";
import userReducer from "./slices/userSlice";
import entryFormSlice from "./slices/entryFormSlice";
import financeReducer from "./slices/financeSlice";
import tasksReducer from "./slices/todoSlice";
import thoughtReducer from "./slices/thoughtsSlice";
import entryEditReducer from "./slices/entryEditSlice";
import memoriesReducer from "./slices/memoriesSlice";

const store = configureStore({
  reducer: {
    entry: entryReducer,
    streak: streakReducer,
    forms: formReducer,
    user: userReducer,
    entryData: entryFormSlice,
    finance: financeReducer,
    todo: tasksReducer,
    thoughts: thoughtReducer,
    entryEdit: entryEditReducer,
    memories: memoriesReducer,
  },
});

export default store;
