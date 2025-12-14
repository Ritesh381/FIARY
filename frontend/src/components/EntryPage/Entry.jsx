import React, { useState, useEffect, useCallback } from "react";
import { Check, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { useSelector, useDispatch } from "react-redux";
import {
  setFormField,
  resetForm,
  loadEntryData,
} from "../../redux/slices/entryFormSlice.js";
import { useNavigate, useLocation } from "react-router";
import { fetchCategoriesAndSubcategories } from "../../redux/slices/financeSlice";
import { addEntry, editEntry as updateEntryInState } from "../../redux/slices/entrySlice.js";
import {
  startEditing,
  editTodo,
  editFinance,
  toggleHabit,
  commitEdits,
  cancelEditing,
} from "../../redux/slices/entryEditSlice";


// API Imports
import apiHabits from "../../api/HabitCalls.js";
import apiTodo from "../../api/TodoCalls.js";
import EntryPageCalls from "../../api/EntryPageCalls"; // Ensure this file has the validation logic

// Component Imports
import JournalAndMoodForm from "./JournalAndMoodForm.jsx";
import TodoSection from "./TodoSection.jsx";
import HabitSection from "./HabitSection.jsx";
import FinanceSection from "./FinanceSection.jsx";


// --- LOCALSTORAGE DRAFT UTILITIES ---
const DRAFT_STORAGE_KEY = 'fiary_entry_drafts';
const MAX_DRAFT_DATES = 5;

/**
 * Get all drafts from localStorage
 * @returns {Array} Array of draft objects
 */
const getAllDrafts = () => {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    // Check if it's the old format (object with date keys)
    if (!Array.isArray(parsed)) {
      console.log('Migrating old localStorage format to new array format');
      // Clear old format data
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return [];
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse drafts from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return [];
  }
};

/**
 * Save all drafts to localStorage
 * @param {Array} drafts - Array of draft objects
 */
const saveAllDrafts = (drafts) => {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error('Failed to save drafts to localStorage:', error);
  }
};

/**
 * Save or update draft for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {Object} formData - Form data {entry, todo, habits, finance}
 */
const saveDraftForDate = (date, formData) => {
  try {
    let drafts = getAllDrafts();

    // Find existing draft for this date
    const existingIndex = drafts.findIndex(d => d.date === date);

    const draftObject = {
      date,
      entry: formData.entry,
      habits: formData.habits,
      todo: formData.todo,
      finance: formData.finance,
      updated_at: Date.now()
    };

    if (existingIndex >= 0) {
      // Update existing draft
      drafts[existingIndex] = draftObject;
    } else {
      // Add new draft
      drafts.push(draftObject);
    }

    // Sort by updated_at (newest first)
    drafts.sort((a, b) => b.updated_at - a.updated_at);

    // Keep only the latest 5 dates
    if (drafts.length > MAX_DRAFT_DATES) {
      drafts = drafts.slice(0, MAX_DRAFT_DATES);
    }

    saveAllDrafts(drafts);
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
};

/**
 * Load draft for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object|null} Draft data or null
 */
const loadDraftForDate = (date) => {
  const drafts = getAllDrafts();
  const draft = drafts.find(d => d.date === date);

  if (!draft) return null;

  // Ensure todo has the correct structure
  const todo = draft.todo || { completed: [], addition: [] };

  // Return in the format expected by loadEntryData
  return {
    entry: draft.entry || {},
    habits: draft.habits || [],
    todos: Array.isArray(todo) ? todo : (todo.addition || []), // Handle both formats
    finance: draft.finance || []
  };
};

/**
 * Clear draft for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 */
const clearDraftForDate = (date) => {
  try {
    const drafts = getAllDrafts();
    const filtered = drafts.filter(d => d.date !== date);
    saveAllDrafts(filtered);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
};

/**
 * Check if draft exists for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean} True if draft exists
 */
const hasDraftForDate = (date) => {
  const drafts = getAllDrafts();
  return drafts.some(d => d.date === date);
};


// --- STATUS OVERLAY COMPONENT ---
const StatusOverlay = ({ state }) => {
  if (state === "hidden") return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col items-center w-64">
        {state === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-white mt-4 text-lg">Saving Entry...</p>
          </>
        )}
        {state === "success" && (
          <>
            <Check size={48} className="text-green-500" />
            <p className="text-white mt-4 text-lg">Entry Saved!</p>
          </>
        )}
      </div>
    </div>
  );
};


const getDayOfWeek = (date) => {
  return new Date(date + "T00:00:00").toLocaleDateString('en-US', { weekday: 'long' });
};

export const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};


// --- MAIN COMPONENT ---
function EntryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // --- Query Params ---
  const params = new URLSearchParams(location.search);
  const queryDate = params.get("date");
  const isEditMode = params.get("edit") === "1";

  // --- Redux State ---
  const reduxDate = useSelector((state) => state.entryData.entry.date);
  const selDate = queryDate || reduxDate;

  const { categories: financeCategories } = useSelector(
    (state) => state.finance
  );
  const user = useSelector((state) => state.user.user);
  const userId = user?._id;
  const formData = useSelector((state) => state.entryData);
  const { entry, todo, habits, finance, status, error } = formData;
  const entryEdit = useSelector((state) => state.entryEdit);

  // --- Local State ---
  const [userHabits, setUserHabits] = useState([]);
  const [overlayState, setOverlayState] = useState("hidden");
  const [todaysTodos, setTodaysTodos] = useState([]);
  // NEW: State for showing validation errors
  const [validationError, setValidationError] = useState(null);
  // NEW: State to signal required fields in JournalAndMoodForm
  const [attemptedSave, setAttemptedSave] = useState(false);

  // DRAFT SYSTEM: Version tracking state
  const [originalData, setOriginalData] = useState(null); // Backend data
  const [editedData, setEditedData] = useState(null);     // localStorage draft
  const [viewingOriginal, setViewingOriginal] = useState(false); // Toggle state
  const [showVersionChoice, setShowVersionChoice] = useState(false); // Choice modal
  const [hasUserEdited, setHasUserEdited] = useState(false); // Prevent autosave on load



  // --- Universal Dispatch Handler ---
  const handleEntryChange = useCallback((section, field, value) => {
    // Clear validation error when the user starts typing/changing input
    setValidationError(null);

    // DRAFT SYSTEM: Mark that user has made edits
    setHasUserEdited(true);

    if (section === "habits" && field === null) {
      dispatch({ type: 'entryData/updateHabitEntry', payload: value });
    } else {
      dispatch(setFormField({ section, field, value }));
    }
  }, [dispatch]);


  // --- Effects for Initialization & Data Loading ---

  useEffect(() => {
    window.scrollTo(0, 0);
    if (selDate && entry.date !== selDate) {
      handleEntryChange("entry", "date", selDate);
    }
  }, [selDate, entry.date, handleEntryChange]);

  useEffect(() => {
    dispatch(fetchCategoriesAndSubcategories());

    const fetchData = async () => {
      try {
        const habits = await apiHabits.getAllHabits();
        setUserHabits(habits.filter((h) => !h.isDeleted));
        const todos = await apiTodo.getPending(selDate);
        setTodaysTodos(todos || []);
      } catch (error) {
        console.error("Failed to fetch habits/todos:", error);
      }
    };
    fetchData();
  }, [selDate, dispatch]);

  // DRAFT SYSTEM: Fetch and store original data in edit mode
  useEffect(() => {
    const fetchEntryData = async () => {
      if (isEditMode && selDate) {
        try {
          setOverlayState("loading");
          const data = await EntryPageCalls.getAll(selDate);

          // Store original data
          setOriginalData(data);

          // Check if there's a localStorage draft
          const draft = loadDraftForDate(selDate);
          if (draft) {
            // Draft exists - store it and show choice modal
            setEditedData(draft);
            setShowVersionChoice(true);
            setOverlayState("hidden");
          } else {
            // No draft - load backend data directly
            dispatch(loadEntryData(data));
            dispatch(startEditing(data));
            setOverlayState("hidden");
          }
        } catch (error) {
          setOverlayState("hidden");
          console.error("Failed to fetch entry data:", error);
        }
      }
    };
    fetchEntryData();
  }, [isEditMode, selDate, dispatch]);

  // DRAFT SYSTEM: Load draft for new entries only
  useEffect(() => {
    if (!selDate || isEditMode) return;

    // For new entries, check if draft exists and load it
    const draft = loadDraftForDate(selDate);
    if (draft) {
      console.log('Loading draft for new entry from localStorage:', selDate);
      dispatch(loadEntryData(draft));
    }
  }, [selDate, isEditMode, dispatch]);

  // DRAFT SYSTEM: Autosave to localStorage (only when user has edited)
  useEffect(() => {
    if (!selDate || !hasUserEdited) return;

    // Debounce autosave by 500ms
    const timer = setTimeout(() => {
      const draftData = { entry, todo, habits, finance };
      saveDraftForDate(selDate, draftData);

      // Update editedData for version comparison
      if (isEditMode) {
        setEditedData(draftData);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [entry, todo, habits, finance, selDate, hasUserEdited, isEditMode]);


  // --- Save/Update Feedback Logic ---
  useEffect(() => {
    if (overlayState === "success") {
      const timer = setTimeout(() => {
        navigate("/");
        dispatch(resetForm());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [overlayState, navigate, dispatch]);

  // --- Save Logic with Validation Catch ---
  const handleSave = async () => {
    setAttemptedSave(true); // Signal to child components to show required fields
    setValidationError(null); // Clear previous errors
    setOverlayState("loading");

    try {
      const resp = await EntryPageCalls.saveAll({
        entry, habits, todos: todo, finance,
      });

      if (resp.success) {
        try {
          // Use the entry returned from backend which has the _id
          const savedEntry = resp.entry || entry;
          dispatch(addEntry({ entry: savedEntry }));
        } catch (err) {
          console.warn("Failed to dispatch addEntry:", err);
        }

        // DRAFT SYSTEM: Clear draft after successful save
        clearDraftForDate(selDate);
        setEditedData(null);
        setHasUserEdited(false);

        setOverlayState("success");
        return;
      }
      setOverlayState("hidden");
    } catch (error) {
      setOverlayState("hidden");

      if (error.message && error.message.includes("required")) {
        setValidationError(error.message);
      } else {
        setValidationError(`Failed to save entry: ${error.message || 'Server error.'}`);
      }

      console.error("Save error:", error);
    }
  };

  const handleUpdate = async () => {
    setAttemptedSave(true);
    setValidationError(null);
    setOverlayState("loading");

    try {
      // Prepare payload from entryEdit.changes
      const { entry, habits, todos, finance } = entryEdit.changes;
      const payload = {
        entryData: entry,
        habitsData: habits,
        todosData: todos,
        financeData: finance,
        date: selDate,
      };

      const resp = await EntryPageCalls.updateAll(payload);
      if (resp.status == "ok") {
        // Update the entry in the entries state (editEntry expects {id, updatedEntry})
        if (resp.entry) {
          dispatch(updateEntryInState({ id: resp.entry._id, updatedEntry: resp.entry }));
        }
        // Also update the form state for immediate UI update
        dispatch(loadEntryData(await EntryPageCalls.getAll(selDate)));

        // DRAFT SYSTEM: Clear draft after successful update
        clearDraftForDate(selDate);
        setEditedData(null);
        setOriginalData(null);
        setHasUserEdited(false);

        setOverlayState("success");
        setTimeout(() => {
          navigate("/");
          dispatch(resetForm());
          dispatch(cancelEditing());
        }, 500);
        return;
      }

      setOverlayState("hidden");
    } catch (error) {
      setOverlayState("hidden");
      setValidationError(`Failed to update entry: ${error.message || 'Server error.'}`);
      console.error("Update error:", error);
    }
  };

  // DRAFT SYSTEM: Handle version choice
  const handleVersionChoice = (chooseEdited) => {
    if (chooseEdited) {
      dispatch(loadEntryData(editedData));
      dispatch(startEditing(editedData));
    } else {
      dispatch(loadEntryData(originalData));
      dispatch(startEditing(originalData));
    }
    setShowVersionChoice(false);
  };

  // DRAFT SYSTEM: Toggle between original and edited versions
  const handleToggleVersion = () => {
    if (viewingOriginal) {
      // Switch to edited version
      const currentData = editedData || { entry, todo, habits, finance };
      dispatch(loadEntryData(currentData));
      setViewingOriginal(false);
    } else {
      // Switch to original version
      dispatch(loadEntryData(originalData));
      setViewingOriginal(true);
    }
  };

  return (
    <div className="bg-transparent min-h-screen text-gray-300 p-4 md:p-8 font-sans mb-20">
      <StatusOverlay state={overlayState} />
      <div className="max-w-4xl mx-auto space-y-8">

        {/* --- HEADER --- */}
        <div className="p-0 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {new Date(selDate + "T00:00:00").toLocaleDateString("en-US", {
                dateStyle: "long",
              })}
            </h1>
            <div className="order-1 sm:order-none w-full sm:w-[88px] flex justify-center items-center py-1">
              <span className="text-lg sm:text-base font-bold text-white tracking-wide">
                {getDayOfWeek(selDate)}
              </span>
            </div>
          </div>

          {/* DRAFT SYSTEM: Version toggle button (edit mode only) */}
          {isEditMode && originalData && (
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handleToggleVersion}
                className="bg-blue-900/30 border border-blue-600/50 text-blue-400 hover:bg-blue-900/50 px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2"
              >
                <span>{viewingOriginal ? "📝 View Edited Version" : "📄 View Original Version"}</span>
              </button>
            </div>
          )}

          {/* --- JOURNAL & MOOD --- */}
          {/* Pass the attemptedSave state to JournalAndMoodForm */}
          <JournalAndMoodForm
            entry={entry}
            handleEntryChange={handleEntryChange}
            attemptedSave={attemptedSave}
          />
        </div>


        {/* --- TODO SECTION --- */}
        <TodoSection
          todo={todo}
          todaysTodos={todaysTodos}
          handleEntryChange={handleEntryChange}
          date={selDate}
        />

        {/* --- HABITS SECTION --- */}
        <HabitSection
          habitsData={habits}
          userHabits={userHabits}
          entryDate={entry.date}
          handleEntryChange={handleEntryChange}
        />

        {/* --- FINANCE SECTION --- */}
        <FinanceSection
          finance={finance}
          financeCategories={financeCategories}
          selDate={selDate}
          handleEntryChange={handleEntryChange}
        />

        {/* --- SAVE BUTTON --- */}
        <div className="flex flex-col items-center justify-center pt-4">

          {/* NEW: Display Validation Error Message */}
          {validationError && (
            <div className="bg-red-900/50 border border-red-600 text-red-300 p-3 rounded-lg flex items-center gap-3 mb-4 w-full max-w-xs text-sm text-center font-medium">
              <AlertTriangle size={20} className="flex-shrink-0" />
              <p className="flex-1 text-left">{validationError}</p>
            </div>
          )}

          {isEditMode ? (
            <button
              onClick={handleUpdate}
              disabled={
                overlayState === "loading" || overlayState === "success"
              }
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed w-full max-w-xs text-base"
            >
              Update Entry
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={
                overlayState === "loading" || overlayState === "success"
              }
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed w-full max-w-xs text-base"
            >
              Save Complete Daily Log
            </button>
          )}

          {status === "failed" && (
            <p className="text-red-400 mt-4 text-sm">{error}</p>
          )}
        </div>

        {/* DRAFT SYSTEM: Version Choice Modal (Edit Mode) */}
        {showVersionChoice && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-3">Unsaved Changes Found</h3>
              <p className="text-gray-300 mb-6 text-sm">
                You have unsaved edits for this entry. Which version would you like to load?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleVersionChoice(false)}
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-md transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <span>📄</span>
                  <span>Load Original (from server)</span>
                </button>
                <button
                  onClick={() => handleVersionChoice(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-md transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <span>📝</span>
                  <span>Load Edited Draft (from localStorage)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EntryPage;
