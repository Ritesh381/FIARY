import React, { useState, useEffect } from "react";
import { X, Check, Save, ChevronLeft, ChevronRight } from "lucide-react";
import apiHabits from "../../api/HabitCalls";

const LogTodayHabits = ({ isOpen, onClose, habits, onEntriesUpdated, selectedDate }) => {
  const [habitStates, setHabitStates] = useState({});
  const [loading, setLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFutureDate, setIsFutureDate] = useState(false);

  // Initialize current date when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedDate) {
        setCurrentDate(new Date(selectedDate));
      } else {
        setCurrentDate(new Date());
      }
    }
  }, [isOpen, selectedDate]);

  // Fetch entries when modal opens or date changes
  useEffect(() => {
    if (isOpen && habits.length > 0) {
      fetchTodaysEntries();
    }
  }, [isOpen, habits, currentDate]);

  const fetchTodaysEntries = async () => {
    try {
      // Check if selected date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDay = new Date(currentDate);
      selectedDay.setHours(0, 0, 0, 0);
      
      if (selectedDay > today) {
        setIsFutureDate(true);
        setHabitStates({});
        return;
      } else {
        setIsFutureDate(false);
      }

      // Format date without timezone conversion
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`; // Format: YYYY-MM-DD
      const entries = await apiHabits.getTodaysEntries(dateStr);

      // Initialize habit states based on fetched entries
      const states = {};
      let hasExistingEntries = false;

      habits.forEach((habit) => {
        const existingEntry = entries.find((e) => e.habitId === habit._id);
        if (existingEntry) {
          hasExistingEntries = true;
          states[habit._id] = {
            done: existingEntry.done,
            notes: existingEntry.notes || "",
            hasEntry: true,
          };
        } else {
          states[habit._id] = {
            done: false,
            notes: "",
            hasEntry: false,
          };
        }
      });

      setHabitStates(states);
      setIsUpdate(hasExistingEntries);
    } catch (error) {
      console.error("Failed to fetch today's entries:", error);
      // Initialize with default states if fetch fails
      const states = {};
      habits.forEach((habit) => {
        states[habit._id] = { done: false, notes: "", hasEntry: false };
      });
      setHabitStates(states);
    }
  };

  const handleToggle = (habitId) => {
    setHabitStates((prev) => ({
      ...prev,
      [habitId]: {
        ...prev[habitId],
        done: !prev[habitId].done,
      },
    }));
  };

  const handleNotesChange = (habitId, notes) => {
    setHabitStates((prev) => ({
      ...prev,
      [habitId]: {
        ...prev[habitId],
        notes,
      },
    }));
  };

  const handleDateChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Format date without timezone conversion
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      // Create ISO string with the correct date at midnight UTC
      const dateISO = `${year}-${month}-${day}T00:00:00.000Z`;

      // Process each habit
      const promises = Object.entries(habitStates).map(
        async ([habitId, state]) => {
          if (state.done) {
            // If checked, upsert the entry
            await apiHabits.upsertHabitEntry({
              habitId,
              date: dateISO,
              done: true,
              notes: state.notes,
            });
          } else if (state.hasEntry || isUpdate) {
            // If unchecked and there was an existing entry, delete it
            try {
              await apiHabits.deleteHabitEntry(habitId, dateISO);
            } catch (error) {
              // It's ok if the entry doesn't exist
              console.log("Entry doesn't exist or already deleted:", error);
            }
          }
        }
      );

      await Promise.all(promises);

      // Notify parent to refresh data
      if (onEntriesUpdated) {
        onEntriesUpdated();
      }

      onClose();
    } catch (error) {
      console.error("Failed to save habit entries:", error);
      alert("Failed to save entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const developHabits = habits.filter(h => h.habitType === 'develop');
  const quitHabits = habits.filter(h => h.habitType === 'quit');

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderHabitItem = (habit, colorClass) => {
    const state = habitStates[habit._id] || { done: false, notes: "" };
    const isDone = state.done;

    let buttonClass = "bg-gray-700/50 border border-gray-600";
    let icon = null;

    if (isDone) {
      buttonClass = `${colorClass} border-${colorClass.split('-')[1]}-500`;
      icon = colorClass.includes('red') ? 
        <X size={16} className="text-white" /> : 
        <Check size={16} className="text-white" />;
    }

    return (
      <div
        key={habit._id}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 border border-gray-700/50 rounded-lg bg-gray-900/30 hover:bg-gray-900/50 transition-colors"
      >
        <div className="flex items-center gap-3 w-full md:w-1/3">
          <span className="text-2xl">{habit.icon}</span>
          <span className="font-medium text-white text-base md:text-lg truncate">
            {habit.title}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-2/3">
          <button
            onClick={() => handleToggle(habit._id)}
            className={`p-1 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${buttonClass}`}
            aria-label={`Toggle habit: ${habit.title}`}
          >
            {icon}
          </button>

          <input
            type="text"
            placeholder="Notes..."
            className="w-full bg-gray-700/50 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50"
            value={state.notes}
            onChange={(e) => handleNotesChange(habit._id, e.target.value)}
            disabled={!isDone}
          />
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            Log Habits
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center justify-center gap-3 p-4 border-b border-gray-700 bg-gray-900/30">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft size={20} className="text-gray-300" />
          </button>
          <div className="text-center min-w-[200px]">
            <p className="text-lg font-semibold text-white">
              {formatDate(currentDate)}
            </p>
          </div>
          <button
            onClick={() => handleDateChange(1)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Next day"
          >
            <ChevronRight size={20} className="text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isFutureDate ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-xl text-yellow-400 font-semibold">
                🙂
              </p>
              <p className="text-gray-300 text-lg">
                To be able to log first you must live through{" "}
                <span className="font-semibold text-white">
                  {formatDate(currentDate)}
                </span>{" "}
                🙂
              </p>
            </div>
          ) : habits.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No habits found. Create some habits first!
            </p>
          ) : (
            <>
              {/* Develop Habits Section */}
              {developHabits.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                    <Check size={20} />
                    Develop Habits
                  </h3>
                  {developHabits.map((habit) => renderHabitItem(habit, 'bg-green-600'))}
                </div>
              )}

              {/* Quit Habits Section */}
              {quitHabits.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <X size={20} />
                    Quit Habits
                  </h3>
                  {quitHabits.map((habit) => renderHabitItem(habit, 'bg-red-600'))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || habits.length === 0 || isFutureDate}
            className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {isUpdate ? "Update" : "Save"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogTodayHabits;
