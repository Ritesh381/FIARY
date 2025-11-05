import React, { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  setFormField,
  resetForm,
  loadEntryData,
} from "../../redux/slices/entryFormSlice.js";
import { useNavigate, useLocation } from "react-router";
import { fetchCategoriesAndSubcategories } from "../../redux/slices/financeSlice";
import { addEntry } from "../../redux/slices/entrySlice.js";

// API Imports
import apiHabits from "../../api/HabitCalls.js";
import apiTodo from "../../api/TodoCalls.js";
import EntryPageCalls from "../../api/EntryPageCalls";

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
    return date.toLocaleDateString('en-US', { weekday: 'long' });
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
  // Ensure date uses queryDate if present, otherwise fall back to Redux state
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


  // --- Universal Dispatch Handler ---
  // This function is key for communicating with the Redux store from children.
  const handleEntryChange = useCallback((section, field, value) => {
    // Special handling for the habit update action type defined in the slice
    if (section === "habits" && field === null) {
        dispatch({ type: 'entryData/updateHabitEntry', payload: value });
    } else {
        // Normal setFormField action
        dispatch(setFormField({ section, field, value }));
    }
  }, [dispatch]);


  // --- Effects for Initialization & Data Loading ---
  
  useEffect(() => {
    window.scrollTo(0, 0);
    // Set date in form state if needed (using setFormField for consistency)
    if (selDate && entry.date !== selDate) {
      handleEntryChange("entry", "date", selDate);
    }
  }, [selDate, entry.date, handleEntryChange]);

  useEffect(() => {
    dispatch(fetchCategoriesAndSubcategories());
    
    // Fetch habits and todos for UI display
    const fetchData = async () => {
      try {
        const habits = await apiHabits.getAllHabits();
        setUserHabits(habits.filter((h) => !h.isDeleted));
        const todos = await apiTodo.getTodosByDate(selDate);
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

  // --- Save/Update Logic (Unchanged) ---
  const handleSave = async () => {
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
      console.error("Failed to save entry:", error);
    }
  };

  const handleUpdate = async () => {
    setOverlayState("loading");
    try {
      const resp = await EntryPageCalls.updateAll({
        entry, habits, todos: todo, finance,
      });

      const updated =
        resp?.entry ||
        resp?.data?.entry ||
        resp?.updatedEntry ||
        resp?.data?.updatedEntry ||
        (resp?.success && resp?.data) ||
        null;

      if (updated) {
        try {
          dispatch(addEntry({ entry: updated }));
        } catch (err) {
          console.warn("Failed to dispatch addEntry for update:", err);
        }
        setOverlayState("success");
        return;
      }
      setOverlayState("hidden");
    } catch (error) {
      setOverlayState("hidden");
      console.error("Failed to update entry:", error);
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
                {getDayOfWeek(new Date(selDate + "T00:00:00"))}
            </span>
        </div>
          </div>
          
          {/* --- JOURNAL & MOOD --- */}
          <JournalAndMoodForm 
            entry={entry}
            handleEntryChange={handleEntryChange}
          />
        </div>


        {/* --- TODO SECTION --- */}
        <TodoSection 
            todo={todo}
            todaysTodos={todaysTodos}
            userId={userId}
            handleEntryChange={handleEntryChange}
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