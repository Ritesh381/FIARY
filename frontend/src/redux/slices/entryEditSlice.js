import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isEditing: false,
  originalEntry: null,
  changes: {
    entry: {},        // {field: newValue}
    habits: [],       // [{habitId, done, notes}]
    todos: {
      completed: [],  // [{_id, action: 'add'|'remove'}]
      addition: [],   // [{id, action: 'add'|'update'|'delete', data?}]
    },
    finance: [],      // [{_id, action: 'add'|'update'|'delete', data?}]
  }
};

const entryEditSlice = createSlice({
  name: "entryEdit",
  initialState,
  reducers: {
    startEditing: (state, action) => {
      state.isEditing = true;
      state.originalEntry = action.payload;
      state.changes = initialState.changes;
    },
    
    // Track main entry field changes
    editEntry: (state, action) => {
      const { field, value } = action.payload;
      state.changes.entry[field] = value;
    },
    
    // Track habit changes
    toggleHabit: (state, action) => {
      const { habitId, done, notes } = action.payload;
      const existingIndex = state.changes.habits.findIndex(h => h.habitId === habitId);
      
      if (existingIndex !== -1) {
        if (done !== undefined) state.changes.habits[existingIndex].done = done;
        if (notes !== undefined) state.changes.habits[existingIndex].notes = notes;
      } else {
        state.changes.habits.push({ habitId, done, notes });
      }
    },
    
    // Track todo changes
    editTodo: (state, action) => {
      const { type, id, action: todoAction, data } = action.payload;
      
      if (type === 'completed') {
        const existingIndex = state.changes.todos.completed.findIndex(t => t._id === id);
        if (existingIndex !== -1) {
          state.changes.todos.completed.splice(existingIndex, 1);
        } else {
          state.changes.todos.completed.push({ _id: id, action: todoAction });
        }
      } else if (type === 'addition') {
        const existingIndex = state.changes.todos.addition.findIndex(t => t.id === id);
        if (existingIndex !== -1) {
          if (todoAction === 'delete') {
            state.changes.todos.addition.splice(existingIndex, 1);
          } else {
            state.changes.todos.addition[existingIndex] = { id, action: todoAction, data };
          }
        } else {
          state.changes.todos.addition.push({ id, action: todoAction, data });
        }
      }
    },
    
    // Track finance changes
    editFinance: (state, action) => {
      const { _id, action: financeAction, data } = action.payload;
      const existingIndex = state.changes.finance.findIndex(f => f._id === _id);
      
      if (existingIndex !== -1) {
        if (financeAction === 'delete') {
          state.changes.finance.splice(existingIndex, 1);
        } else {
          state.changes.finance[existingIndex] = { _id, action: financeAction, data };
        }
      } else {
        state.changes.finance.push({ _id, action: financeAction, data });
      }
    },
    
    commitEdits: (state) => {
      console.log('Changes to be committed:', state.changes);
      return initialState;
    },
    
    cancelEditing: () => initialState
  }
});

export const {
  startEditing,
  editEntry,
  toggleHabit,
  editTodo,
  editFinance,
  commitEdits,
  cancelEditing
} = entryEditSlice.actions;

export default entryEditSlice.reducer;
