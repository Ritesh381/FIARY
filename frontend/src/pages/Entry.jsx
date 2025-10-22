import React, { useState, useEffect } from "react";
import { Plus, Camera, X as XIcon, Check } from "lucide-react";
import MoodSelector from "../components/MoodSelector.jsx";
import { useSelector, useDispatch } from "react-redux";
import {
  setFormField,
  updateHabitEntry,
  saveDailyEntry,
  resetForm,
} from "../redux/slices/entryFormSlice.js";
import apiHabits from "../api/HabitCalls.js";
import { useNavigate } from "react-router";

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

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-gray-800/50 border border-gray-700/80 rounded-2xl shadow-lg ${className}`}
  >
    {children}
  </div>
);

// --- HELPER HOOK for managing state of "pending" items like Finance ---
const useFinanceForm = () => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Expense");
  const reset = () => {
    setAmount("");
    setNote("");
  };

  return {
    amount,
    setAmount,
    note,
    setNote,
    category,
    reset,
    data: { amount, note, category },
  };
};

// --- MAIN COMPONENT ---
function EntryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selDate = useSelector((state) => state.forms.date);

  // Get all form data from Redux
  const formData = useSelector((state) => state.entryData);
  const { entry, todo, habits, finance, status, error } = formData;

  // Local state for UI things
  const [userHabits, setUserHabits] = useState([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [overlayState, setOverlayState] = useState("hidden"); // 'hidden', 'loading', 'success'
  const financeForm = useFinanceForm();

  // --- FIX: Scroll to top on page load ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(setFormField({ section: "entry", field: "date", value: selDate }));
  }, []);

  // Fetch the user's defined habits on load
  useEffect(() => {
    const fetchUserHabits = async () => {
      try {
        const habits = await apiHabits.getAllHabits();
        setUserHabits(habits.filter((h) => !h.isDeleted));
      } catch (error) {
        console.error("Failed to fetch user habits:", error);
      }
    };
    fetchUserHabits();
  }, []);

  // Effect to handle navigation and overlays based on save status
  useEffect(() => {
    if (status === "loading") {
      setOverlayState("loading");
    } else if (status === "succeeded") {
      setOverlayState("success"); // Show "Saved!"

      const timer = setTimeout(() => {
        navigate("/");
      }, 500); // 500ms delay

      return () => clearTimeout(timer); // Cleanup timer if component unmounts
    } else if (status === "failed") {
      setOverlayState("hidden"); // Hide overlay, show error message below button
    }
  }, [status, navigate]);

  // --- Handlers ---

  // Generic handler to update the main 'entry' section
  const handleEntryChange = (field, value) => {
    dispatch(setFormField({ section: "entry", field, value }));
  };

  // Handler for "Create Todos for tomorrow"
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoText.trim() === "") return;

    const newAdditions = [
      ...todo.addition,
      { id: Date.now(), text: newTodoText },
    ];
    dispatch(
      setFormField({ section: "todo", field: "addition", value: newAdditions })
    );
    setNewTodoText("");
  };

  // Handler for "Today's Todos" (marking as complete)
  const handleCompleteTodo = (task) => {
    console.log("Marking as complete (not saved to Redux yet):", task);
  };

  const handleHabitNotesChange = (habit, newNotes) => {
    dispatch(
      updateHabitEntry({
        habitId: habit._id,
        entry: {
          notes: newNotes,
          date: entry.date, // Also include date to create the entry if it doesn't exist
        },
      })
    );
  };

  // --- FIX: Handler for "Habits" section with 3-state quit logic ---
  const handleHabitToggle = (habit, currentEntry) => {
    const isDone = currentEntry?.done || false; // Default to false if no entry
    let newDoneStatus;

    newDoneStatus = !isDone;

    dispatch(
      updateHabitEntry({
        habitId: habit._id,
        entry: { done: newDoneStatus, date: new Date().toISOString() },
      })
    );
  };

  // Handler for "Finance" section
  const handleAddFinance = (e) => {
    e.preventDefault();
    if (!financeForm.amount || !financeForm.note) return;

    const newFinanceEntry = {
      id: Date.now(),
      ...financeForm.data,
    };
    const newFinanceList = [...finance, newFinanceEntry];
    dispatch(
      setFormField({
        section: "finance",
        field: "finance",
        value: newFinanceList,
      })
    );
    financeForm.reset();
  };

  // Handler for the main "Save" button
  const handleSave = () => {
    dispatch(saveDailyEntry());
  };

  return (
    <div className="bg-transparent min-h-screen text-gray-300 p-4 md:p-8 font-sans mb-20">
      <StatusOverlay state={overlayState} />
      <div className="max-w-4xl mx-auto space-y-8">
        {/* --- HEADER & MOOD --- */}
        <div className="p-4 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">
              {new Date(selDate).toLocaleDateString("en-US", {
                dateStyle: "long",
              })}
            </h1>
          </div>
          <MoodSelector
            selectedMood={entry.feelingScore}
            setSelectedMood={(value) =>
              handleEntryChange("feelingScore", value)
            }
          />
        </div>

        {/* --- JOURNAL & NOTES (REDESIGNED TOP PART) --- */}
        <div className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <textarea
                rows="3"
                placeholder="Achievement of the day"
                className="w-full bg-gray-800/70 resize-none rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 "
                value={entry.achievement}
                onChange={(e) =>
                  handleEntryChange("achievement", e.target.value)
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0"
                  className="w-16 bg-gray-800/70 text-center rounded-lg p-2 focus:outline-none focus:ring-2 "
                  value={entry.sleepHours}
                  onChange={(e) =>
                    handleEntryChange("sleepHours", e.target.value)
                  }
                />
                <span className="text-sm text-gray-400">Hrs</span>
                <input
                  type="text"
                  placeholder="Sleep Notes"
                  className="flex-grow bg-transparent focus:outline-none border-b border-gray-700 focus:border-white"
                  value={entry.sleepNotes}
                  onChange={(e) =>
                    handleEntryChange("sleepNotes", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0"
                  className="w-16 bg-gray-800/70 text-center rounded-lg p-2 focus:outline-none focus:ring-2 "
                  value={entry.timeWastedMinutes}
                  onChange={(e) =>
                    handleEntryChange("timeWastedMinutes", e.target.value)
                  }
                />
                <span className="text-sm text-gray-400">Min</span>
                <input
                  type="text"
                  placeholder="Unutilized time Notes"
                  className="flex-grow bg-transparent focus:outline-none border-b border-gray-700 focus:border-white"
                  value={entry.timeWastedNotes}
                  onChange={(e) =>
                    handleEntryChange("timeWastedNotes", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
          <textarea
            rows="12"
            placeholder="Start writing your beautiful day's story...."
            className="w-full bg-gray-800/70 rounded-lg resize-none px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 "
            value={entry.diaryEntry}
            onChange={(e) => handleEntryChange("diaryEntry", e.target.value)}
          />
        </div>

        {/* --- TODAY'S TODOS --- */}
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Today's Todos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {/* This should be populated by a fetch call for today's todos */}
            {["Will be added soon"].map((task) => (
              <div
                key={task}
                className="flex items-center gap-3 bg-gray-800/70 p-3 rounded-lg cursor-pointer hover:bg-gray-700"
                onClick={() => handleCompleteTodo(task)}
              >
                <div className="w-4 h-4 rounded-full border-2 border-gray-500"></div>
                <span>{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- CREATE TODOS FOR TOMORROW --- */}
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Create Todos for tomorrow</h2>
          <div className="space-y-3">
            <form onSubmit={handleAddTodo} className="relative">
              <input
                type="text"
                placeholder="Dosen't work for now just a placeholder"
                className="w-full bg-gray-800/70 rounded-lg pl-4 pr-10 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 "
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <Plus size={20} />
              </button>
            </form>
            {/* Display todos added to Redux state */}
            {todo.addition.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800/70 p-3 rounded-lg text-gray-400"
              >
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* --- HABITS SECTION --- */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Habits</h2>
          <div className="space-y-3">
            {" "}
            {/* Increased spacing */}
            {userHabits.map((habit) => {
              const habitEntry = habits.find((h) => h.habitId === habit._id);
              const isDone = habitEntry?.done === true;

              let buttonClass = "bg-gray-700"; // Default: Gray
              let icon = null;

              if (isDone) {
                buttonClass = "bg-green-500";
                icon = <Check size={16} className="text-white" />;
              }

              return (
                <div
                  key={habit._id}
                  className="flex items-center justify-between gap-3 p-2"
                >
                  {/* Left Side: Title */}
                  <span className="font-medium w-1/3 truncate">
                    {" "}
                    {/* Added truncate */}
                    {habit.icon} {habit.title}
                  </span>

                  {/* Right Side: Controls (Checkbox + Input) */}
                  <div className="flex items-center gap-2 w-2/3">
                    <button
                      onClick={() => handleHabitToggle(habit, habitEntry)}
                      className={`p-1 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${buttonClass}`}
                    >
                      {icon}
                    </button>

                    <input
                      type="text"
                      placeholder="Notes..."
                      className="w-full bg-gray-700/50 rounded-md px-3 py-1 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={habitEntry?.notes || ""}
                      onChange={(e) =>
                        handleHabitNotesChange(habit, e.target.value)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* --- FINANCE SECTION --- */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Finance (Coming soon)</h2>
          <form onSubmit={handleAddFinance} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="bg-gray-700 px-3 py-1 rounded-full">
                Expense
              </span>
              <span className="bg-gray-700 px-3 py-1 rounded-full">
                Category
              </span>
              <span className="bg-gray-700 px-3 py-1 rounded-full">
                Sub-Category
              </span>
              <Camera size={20} className="text-gray-400 cursor-pointer" />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                ₹
              </span>
              <input
                type="number"
                placeholder="Amount"
                className="w-full bg-gray-800/7F0 rounded-lg pl-8 pr-4 py-3"
                value={financeForm.amount}
                onChange={(e) => financeForm.setAmount(e.target.value)}
              />
            </div>
            <input
              type="text"
              placeholder="Note"
              className="w-full bg-gray-800/70 rounded-lg px-4 py-3"
              value={financeForm.note}
              onChange={(e) => financeForm.setNote(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm"
            >
              Add
            </button>
            <div className="flex flex-wrap gap-4 pt-4">
              {finance.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900/80 p-3 rounded-lg flex gap-3 items-start relative"
                >
                  <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center">
                    <span className="text-2xl">🍕</span>
                  </div>
                  <div>
                    <p className="font-semibold">{item.category}</p>
                    <p className="text-gray-400 text-sm">₹ {item.amount}</p>
                    <p className="text-gray-400 text-sm">{item.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      /* Add remove logic here */
                    }}
                  >
                    <XIcon
                      size={14}
                      className="absolute top-2 right-2 text-gray-500 cursor-pointer"
                    />
                  </button>
                </div>
              ))}
            </div>
          </form>
        </GlassCard>

        {/* --- SAVE BUTTON (MODIFIED) --- */}
        <div className="flex flex-col items-center justify-center pt-4">
          <button
            onClick={handleSave}
            disabled={status === "loading" || overlayState === "success"}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Save Entry
          </button>

          {status === "failed" && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default EntryPage;
