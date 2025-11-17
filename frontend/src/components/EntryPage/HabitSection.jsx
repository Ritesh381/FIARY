import React, { useCallback, useMemo } from "react";
import { Check, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleHabit } from "../../redux/slices/entryEditSlice";
import { GlassCard } from "./GlassCard.jsx";

const HabitSection = ({
  habitsData,
  userHabits,
  entryDate,
  handleEntryChange,
}) => {
  const dispatch = useDispatch();
  const isEditing = useSelector((state) => state.entryEdit.isEditing);

  const handleHabitToggle = useCallback(
    (habit, currentEntry) => {
      const isDone = currentEntry?.done || false;

      handleEntryChange("habits", null, {
        habitId: habit._id,
        entry: { done: !isDone, date: entryDate },
      });

      if (isEditing) {
        dispatch(toggleHabit({ habitId: habit._id, done: !isDone }));
      }
    },
    [entryDate, handleEntryChange, dispatch, isEditing]
  );

  const handleHabitNotesChange = useCallback(
    (habit, newNotes) => {
      handleEntryChange("habits", null, {
        habitId: habit._id,
        entry: { notes: newNotes, date: entryDate },
      });

      // Optional: if you want notes tracked as well
      dispatch(toggleHabit({ habitId: habit._id, notes: newNotes }));
    },
    [entryDate, handleEntryChange, dispatch]
  );

  const safeHabitsData = Array.isArray(habitsData) ? habitsData : [];

  // Separate habits by type
  const developHabits = useMemo(
    () => userHabits.filter((habit) => habit.habitType === "develop" || !habit.habitType),
    [userHabits]
  );

  const quitHabits = useMemo(
    () => userHabits.filter((habit) => habit.habitType === "quit"),
    [userHabits]
  );

  // Helper component to render a single habit
  const renderHabitItem = (habit) => {
    const habitEntry = safeHabitsData.find((h) => h.habitId === habit._id);
    const isDone = habitEntry?.done === true;

    let buttonClass = "bg-gray-700/50 border border-gray-600";
    let icon = null;

    if (habit.habitType === "quit") {
      // For quit habits, show X when done
      if (isDone) {
        buttonClass = "bg-red-600 border-red-500";
        icon = <X size={16} className="text-white" />;
      }
    } else {
      // For develop habits, show Check when done
      if (isDone) {
        buttonClass = "bg-green-600 border-green-500";
        icon = <Check size={16} className="text-white" />;
      }
    }

    return (
      <div
        key={habit._id}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3 p-2 border-b border-gray-700/50 last:border-b-0"
      >
        <span className="font-medium w-full md:w-1/3 truncate text-white text-base md:text-lg">
          {habit.icon} {habit.title}
        </span>

        <div className="flex items-center gap-2 w-full md:w-2/3">
          <button
            onClick={() => handleHabitToggle(habit, habitEntry)}
            className={`p-1 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${buttonClass}`}
            aria-label={`Toggle habit: ${habit.title}`}
          >
            {icon}
          </button>

          <input
            type="text"
            placeholder="Notes..."
            className="w-full bg-gray-700/50 rounded-md px-3 py-1 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-400 border border-gray-700/50"
            value={habitEntry?.notes || ""}
            onChange={(e) =>
              handleHabitNotesChange(habit, e.target.value)
            }
            disabled={!isDone}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* --- DEVELOP HABITS --- */}
      <GlassCard className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
          Develop Habits
        </h2>
        <div className="space-y-2 md:space-y-3">
          {developHabits.length === 0 ? (
            <p className="text-gray-500 italic text-sm">
              No develop habits defined.
            </p>
          ) : (
            developHabits.map((habit) => renderHabitItem(habit))
          )}
        </div>
      </GlassCard>

      {/* --- QUIT HABITS --- */}
      <GlassCard className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
          Quit Habits
        </h2>
        <div className="space-y-2 md:space-y-3">
          {quitHabits.length === 0 ? (
            <p className="text-gray-500 italic text-sm">
              No quit habits defined.
            </p>
          ) : (
            quitHabits.map((habit) => renderHabitItem(habit))
          )}
        </div>
      </GlassCard>
    </>
  );
};

export default HabitSection;
