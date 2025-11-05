import { createSlice } from "@reduxjs/toolkit";

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
});

export const { setFormField, updateHabitEntry, resetForm, setEntryDate, loadEntryData } =
  entryFormSlice.actions;

export default entryFormSlice.reducer;
