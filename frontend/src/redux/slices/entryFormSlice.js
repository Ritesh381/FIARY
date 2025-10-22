import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// --- Assumed API Imports ---
// You will need to create and import these API service files.
import api from "../../api/EntryCalls"; // Assumed path for journal entries
import apiHabits from "../../api/HabitCalls"; // Assumed path for habits
// import apiTodos from '../../api/TodoCalls';
// import apiFinance from '../../api/FinanceCalls';

/**
 * Async thunk to save the entire daily entry form.
 * It reads the state, and dispatches API calls for each section.
 */
export const saveDailyEntry = createAsyncThunk(
  "entryData/saveDailyEntry",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().entryData; // Get state from 'entryData' slice
      const { entry, todo, habits, finance } = state;

      const apiPromises = [];

      // 1. Save the main journal entry
      apiPromises.push(api.saveEntry(entry));

      // 2. Save habit entries if they exist
      if (habits && habits.length > 0) {
        apiPromises.push(apiHabits.createHabitEntries(habits));
      }

      // 3. Placeholder for saving Todos
      // if (todo.completed.length > 0 || todo.addition.length > 0) {
      //   apiPromises.push(apiTodos.saveTodos(todo));
      // }

      // 4. Placeholder for saving Finance entries
      // if (finance.length > 0) {
      //   apiPromises.push(apiFinance.saveTransactions(finance));
      // }

      await Promise.all(apiPromises);

      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "An unknown error occurred"
      );
    }
  }
);

const initialState = {
  entry: {
    date: new Date().toISOString(),
    feelingScore: null,
    achievement: "",
    sleepHours: "",
    sleepNotes: "",
    timeWastedMins: "",
    timeWastedNotes: "",
    diaryEntry: "",
  },
  todo: {
    completed: [],
    addition: [],
  },
  habits: [],
  finance: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const entryFormSlice = createSlice({
  name: "entryData",
  initialState,
  reducers: {
    setFormField: (state, action) => {
      const { section, field, value } = action.payload;
      if (state[section] && typeof state[section][field] !== "undefined") {
        state[section][field] = value;
      }
    },
    updateHabitEntry: (state, action) => {
      const { habitId, entry } = action.payload;
      const existingIndex = state.habits.findIndex(
        (h) => h.habitId === habitId
      );

      if (existingIndex > -1) {
        state.habits[existingIndex] = {
          ...state.habits[existingIndex],
          ...entry,
        };
      } else {
        state.habits.push({ habitId, ...entry });
      }
    },
    resetForm: (state) => {
      // Resets the form but preserves the status
      state.entry = { ...initialState.entry, date: new Date().toISOString() };
      state.todo = initialState.todo;
      state.habits = initialState.habits;
      state.finance = initialState.finance;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveDailyEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(saveDailyEntry.fulfilled, (state) => {
        // On success, reset the form and set status to 'succeeded'
        return {
          ...initialState,
          status: "succeeded",
          entry: { ...initialState.entry, date: new Date().toISOString() },
        };
      })
      .addCase(saveDailyEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setFormField, updateHabitEntry, resetForm } =
  entryFormSlice.actions;

export default entryFormSlice.reducer;
