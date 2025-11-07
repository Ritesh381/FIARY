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
import { addEntry } from "../../redux/slices/entrySlice.js";
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

  // --- Local State ---
  const [userHabits, setUserHabits] = useState([]);
  const [overlayState, setOverlayState] = useState("hidden");
  const [todaysTodos, setTodaysTodos] = useState([]);
  // NEW: State for showing validation errors
  const [validationError, setValidationError] = useState(null); 
  // NEW: State to signal required fields in JournalAndMoodForm
  const [attemptedSave, setAttemptedSave] = useState(false);


  // --- Universal Dispatch Handler ---
  const handleEntryChange = useCallback((section, field, value) => {
    // Clear validation error when the user starts typing/changing input
    setValidationError(null); 
    
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

  useEffect(() => {
    const fetchEntryData = async () => {
      if (isEditMode && selDate) {
        try {
          setOverlayState("loading");
          const data = await EntryPageCalls.getAll(selDate);
          dispatch(loadEntryData(data));
          dispatch(startEditing(data));
          setOverlayState("hidden");
        } catch (error) {
          setOverlayState("hidden");
          console.error("Failed to fetch entry data:", error);
        }
      }
    };
    fetchEntryData();
  }, [isEditMode, selDate, dispatch]);

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
          dispatch(addEntry({ entry }));
        } catch (err) {
          console.warn("Failed to dispatch addEntry:", err);
        }
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
      // First log all tracked changes
      dispatch(commitEdits());
      
      // For now, just simulate success
      setOverlayState("success");
      setTimeout(() => {
        navigate("/");
        dispatch(resetForm());
        dispatch(cancelEditing());
      }, 500);
      
    } catch (error) {
      setOverlayState("hidden");
      setValidationError(`Failed to update entry: ${error.message || 'Server error.'}`);
      console.error("Update error:", error);
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
      </div>
    </div>
  );
}

export default EntryPage;