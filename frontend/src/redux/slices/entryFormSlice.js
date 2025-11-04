import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addEntry } from "./entrySlice";
import api from "../../api/EntryCalls";
import apiHabits from "../../api/HabitCalls";
import apiTodos from '../../api/TodoCalls';
import apiFinance from '../../api/FinanceCalls'; // Assuming you have this API client

export const saveDailyEntry = createAsyncThunk(
  "entryData/saveDailyEntry",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().entryData;
      const { entry, todo, habits, finance } = state;

      const apiPromises = [];

      // 1. Save the main Journal Entry (MANDATORY)
      const entryResponse = await api.saveEntry(entry);
      // const entryResponse = entry;
      console.log("Saving journal entry: ", entryResponse);

      // 2. Save Habit entries (if they exist)
      if (habits && habits.length > 0) {
        console.log("Saving habits:", habits);
        for (const habitEntry of habits) {
          apiPromises.push(apiHabits.upsertHabitEntry(habitEntry));
        }
      }

      // 3. Save Todos (NEW INTEGRATION)
      // The Entry page should save the todos the user marked as completed or created for tomorrow
      if (todo.completed.length > 0 || todo.addition.length > 0) {
         console.log("Saving todos:", todo);
        // Assuming your backend supports a route to handle completed tasks and new additions
        apiPromises.push(apiTodos.saveDayTodos({ 
            completed: todo.completed, 
            additions: todo.addition,
            date: entry.date // Pass date if needed for context
        }));
      }

      // 4. Save Finance entries (NEW INTEGRATION)
      if (finance.length > 0) {
         console.log("Saving finance transactions:", finance);
         for(const transaction of finance) {
             // Saving each transaction individually (assuming this simplified approach)
             apiPromises.push(apiFinance.createFinance(transaction));
         }
      }

      // Execute all optional API calls concurrently
      await Promise.all(apiPromises);
      
      // Update Redux state and reset form
      dispatch(addEntry(entryResponse));
      dispatch(resetForm());

      // return entryResponse;
    } catch (error) {
      console.error("Error in saveDailyEntry:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An unknown error occurred"
      );
    }
  }
);

const initialState = {
  entry: {
    date: new Date().toISOString().split('T')[0], // Use YYYY-MM-DD
    feelingScore: null,
    achievement: "",
    sleepHours: "",
    sleepNotes: "",
    timeWastedMinutes: "",
    timeWastedNotes: "",
    diaryEntry: "",
  },
  todo: {
    completed: [], // Tasks marked as done today
    addition: [],  // New tasks created for tomorrow
  },
  habits: [], // Habit entries for the day
  finance: [], // Temporary finance transactions for the day
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  _id: undefined,
};

const entryFormSlice = createSlice({
  name: "entryData",
  initialState,
  reducers: {
    setFormField: (state, action) => {
      const { section, field, value } = action.payload;
      if (state[section] && typeof state[section][field] !== "undefined") {
        state[section][field] = value;
      } else if (state[section]) {
         // Handle direct object replacement if field is the section itself (e.g., finance list)
        state[section] = value;
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
    // Load complete form data for editing an existing day
    loadEntryData: (state, action) => {
      const { entry, habits, todo, finance, _id } = action.payload || {};
      // Ensure we don't accidentally share references
      state.entry = {
        date: entry?.date ?? state.entry.date,
        feelingScore: entry?.feelingScore ?? state.entry.feelingScore,
        achievement: entry?.achievement ?? state.entry.achievement,
        sleepHours: entry?.sleepHours ?? state.entry.sleepHours,
        sleepNotes: entry?.sleepNotes ?? state.entry.sleepNotes,
        timeWastedMinutes: entry?.timeWastedMinutes ?? state.entry.timeWastedMinutes,
        timeWastedNotes: entry?.timeWastedNotes ?? state.entry.timeWastedNotes,
        diaryEntry: entry?.diaryEntry ?? state.entry.diaryEntry,
        // keep other fields as-is if not provided
      };
      state.habits = Array.isArray(habits) ? habits : [];
      state.todo = todo || { completed: [], addition: [] };
      state.finance = Array.isArray(finance) ? finance : [];
      state._id = _id;
    },
    resetForm: () => ({
      ...initialState,
      entry: {
        ...initialState.entry,
        date: new Date().toISOString().split('T')[0],
      },
    }),

    setEntryDate: (state, action) => {
      state.entry.date = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveDailyEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(saveDailyEntry.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(saveDailyEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setFormField, updateHabitEntry, resetForm, setEntryDate, loadEntryData } =
  entryFormSlice.actions;

export default entryFormSlice.reducer;
