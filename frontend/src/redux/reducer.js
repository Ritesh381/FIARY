import { SET_ENTRIES,SELECTED_DATE, TOGGLE_SAVE_FORM, SET_STREAK, TOGGLE_EDIT_FORM } from "./actions";

const initialState = {
  entries: [],
  streak: 0,
  isFormOpen: false,
  selectedDate: new Date(),
  isEditFormOpen: false,
};

const entriesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ENTRIES:
      return {
        ...state,
        entries: action.payload,
      };
    case SET_STREAK:
      return {
        ...state,
        streak: action.payload,
      };
    case TOGGLE_SAVE_FORM:
      return {
        ...state,
        isFormOpen: !state.isFormOpen,
      };
    case SELECTED_DATE:
      return{
        ...state,
        selectedDate: action.payload
      };
    case TOGGLE_EDIT_FORM:
      return{
        ...state,
        isEditFormOpen: !state.isEditFormOpen,
      }
    default:
      return state;
  }
};

export default entriesReducer;
