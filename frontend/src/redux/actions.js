// For entries array
export const SET_ENTRIES = "SET_ENTRIES";

export const setEntries = (entries) => ({
  type: SET_ENTRIES,
  payload: entries,
});

// For streak counter
export const SET_STREAK = "SET_STREAK";

export const setStreak = (streak) => ({
  type: SET_STREAK,
  payload: streak,
});

// For save entry form
export const TOGGLE_SAVE_FORM = "TOGGLE_SAVE_FORM";

export const toggleForm = () => ({
  type: TOGGLE_SAVE_FORM,
});

// For edit entry form
export const TOGGLE_EDIT_FORM = "TOGGLE_EDIT_FORM";

export const toggleEditForm = () => ({
  type: TOGGLE_EDIT_FORM
})

// For date in save entry form
export const SELECTED_DATE = "SELECTED_DATE";

export const setDate = (selectedDate) => ({
  type:SELECTED_DATE,
  payload: selectedDate,
})
