import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  feeling: "",
  feelingScore: null,
  bestMoment: "",
  worstMoment: "",
  achievement: "",
  timeWastedMinutes: 0,
  timeWastedNotes: "",
  sleepHours: 0,
  sleepNotes: "",
  physicalActivity: "",
  didMasturbate: false,
  masturbationNotes: "",
  didTakeBath: false,
  diaryEntry: "",
};

export const entryForm = createSlice({
  name: "journalForm",
  initialState,
  reducers: {
    setFormField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    resetForm: () => initialState,
  },
});

export const { setFormField, resetForm } = entryForm.actions;
export default entryForm.reducer;
