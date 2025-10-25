import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addEntry } from "./entrySlice";
import api from "../../api/EntryCalls";
import apiHabits from "../../api/HabitCalls";
// import apiTodos from '../../api/TodoCalls';
// import apiFinance from '../../api/FinanceCalls';

export const saveDailyEntry = createAsyncThunk(
  "entryData/saveDailyEntry",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().entryData;
      const { entry, todo, habits, finance } = state;

      const apiPromises = [];

      const entryResponse = await api.saveEntry(entry);
      console.log("SAving entry: ", entry);
      // --- *** THIS IS THE FIX *** ---
      // 2. Save habit entries if they exist
      if (habits && habits.length > 0) {
        console.log("Saving habits:", habits);
        for (const habitEntry of habits) {
          apiPromises.push(apiHabits.upsertHabitEntry(habitEntry));
        }
      }
      // --- *** END OF FIX *** ---

      // 3. Placeholder for saving Todos
      // if (todo.completed.length > 0 || todo.addition.length > 0) {
      //   apiPromises.push(apiTodos.saveTodos(todo));
      // }

      // 4. Placeholder for saving Finance entries
      // if (finance.length > 0) {
      //   apiPromises.push(apiFinance.saveTransactions(finance));
      // }
      await Promise.all(apiPromises);
      dispatch(addEntry(entry))
      dispatch(resetForm());

      return entryResponse;
      // We don't call resetForm here. The extraReducer will handle it.
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
    date: new Date().toISOString(),
    feelingScore: null,
    achievement: "",
    sleepHours: "",
    sleepNotes: "",
    timeWastedMinutes: "",
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
    resetForm: () => ({
      ...initialState,
      entry: {
        ...initialState.entry,
        date: new Date().toISOString(),
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

export const { setFormField, updateHabitEntry, resetForm, setEntryDate } =
  entryFormSlice.actions;

export default entryFormSlice.reducer;
