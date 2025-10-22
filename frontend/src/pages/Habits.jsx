import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Check,
  X,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import apiHabits from "../api/HabitCalls";
import AddHabitModal from "../components/habits/AddHabit";
import EditHabitModal from "../components/habits/EditHabit";
import { useHabitAnalytics } from "../hooks/useHabitAnalytics";
import OverallDashboard from "../components/habits/OverallDashboard";
import HabitAnalytics from "../components/habits/HabitAnalytics";
import Calendar from "../components/Calendar";

const GlobalStyles = () => (
  <style>{`
        body {
            font-family: 'Inter', sans-serif;
            background: #0D1117;
            background: radial-gradient(circle, rgba(13,42,66,0.8) 0%, #0D1117 70%);
            color: #c9d1d9;
        }
        .glass-card {
            background: rgba(22, 27, 34, 0.6);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(80, 88, 101, 0.5);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            border-radius: 16px;
        }
        .glass-button {
            background: rgba(34, 197, 94, 0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(34, 197, 94, 0.4);
            transition: all 0.2s ease-in-out;
        }
        .glass-button:hover {
            background: rgba(34, 197, 94, 0.4);
            border-color: rgba(34, 197, 94, 0.6);
        }
        .glass-select {
            background: rgba(32, 38, 48, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(56, 62, 74, 0.5);
        }
        .tooltip { position: relative; display: inline-block; }
        .tooltip .tooltip-text {
            visibility: hidden;
            width: max-content;
            max-width: 350px;
            white-space: normal;
            background-color: #161B22; 
            color: #fff; 
            text-align: left;
            border-radius: 6px; 
            padding: 10px;
            position: absolute; 
            z-index: 10; 
            bottom: 125%; 
            left: 50%;
            transform: translateX(-50%);
            margin-left: 0;
            opacity: 0; 
            transition: opacity 0.3s; 
            border: 1px solid rgba(56, 62, 74, 0.8);
            font-size: 1.05rem;
            line-height: 1.4;
        }
        .tooltip:hover .tooltip-text { 
            visibility: visible; 
            opacity: 1; 
        }

        .habit-tracker-grid::-webkit-scrollbar { height: 8px; }
        .habit-tracker-grid::-webkit-scrollbar-track { background: rgba(22, 27, 34, 0.6); border-radius: 10px; }
        .habit-tracker-grid::-webkit-scrollbar-thumb { background: #2a3038; border-radius: 10px; }
        .habit-tracker-grid::-webkit-scrollbar-thumb:hover { background: #3e444c; }

        /* --- NEW STYLES FOR ANALYTICS CARD --- */
        .analytic-card {
            border-left-width: 4px;
            padding: 16px;
            border-radius: 12px;
            transition: all 0.2s ease-in-out;
        }
        .analytic-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

    `}</style>
);

// --- Page Components ---

const HeaderControls = ({ onAddNew, currentDate, onMonthChange }) => (
  <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
    <button
      onClick={onAddNew}
      className="glass-button w-full md:w-auto text-green-300 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
    >
      <Plus size={20} /> Add New Habit
    </button>
    <div className="flex items-center gap-2 glass-select p-1 rounded-lg">
      <button
        onClick={() => onMonthChange(-1)}
        className="p-2 rounded-md hover:bg-gray-700"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="font-semibold text-lg w-36 text-center">
        {currentDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </span>
      <button
        onClick={() => onMonthChange(1)}
        className="p-2 rounded-md hover:bg-gray-700"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
);

const HabitGrid = ({
  title,
  habits,
  entries,
  currentDate,
  isQuitHabit = false,
}) => {
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (habits.length === 0) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-400">
          No habits of this type yet. Add one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 md:p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="overflow-x-auto habit-tracker-grid">
        <div
          className="grid gap-x-2 text-sm text-center"
          style={{
            gridTemplateColumns: `minmax(150px, 1fr) repeat(${daysInMonth}, minmax(32px, 1fr))`,
          }}
        >
          {/* Headers */}
          <div className="sticky left-0 bg-gray-800/50 p-2 font-semibold text-left z-10">
            Habit
          </div>
          {daysArray.map((day) => (
            <div key={day} className="p-2 w-8 flex items-center justify-center">
              {day}
            </div>
          ))}

          {/* Rows */}
          {habits.map((habit) => {
            const habitEntries = entries[habit._id] || [];
            return (
              <React.Fragment key={habit._id}>
                <div className="sticky left-0 bg-gray-800/50 p-2 font-semibold text-left truncate z-10">
                  {habit.title}
                </div>
                {daysArray.map((day) => {
                  const entry = habitEntries.find(
                    (e) => new Date(e.date).getUTCDate() === day
                  );

                  let icon = (
                    <div className="w-6 h-6 rounded-full bg-gray-700/50 mx-auto"></div>
                  );
                  const entryExists = entry != null;
                  const isDone = entry?.done === true;

                  if (isQuitHabit) {
                    if (entryExists && isDone) {
                      icon = <X className="text-red-400 mx-auto" />;
                    } else if (entryExists && !isDone) {
                      icon = <Check className="text-green-400 mx-auto" />;
                    }
                  } else {
                    if (isDone) {
                      icon = <Check className="text-green-400 mx-auto" />;
                    }
                  }

                  return (
                    <div
                      key={day}
                      className="p-1 flex items-center justify-center"
                    >
                      {entry?.notes ? (
                        <div className="tooltip">
                          {icon}
                          <span className="tooltip-text">{entry.notes}</span>
                        </div>
                      ) : (
                        icon
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- REMOVED HabitManagementList component ---

// --- Main App Component ---
export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [entries, setEntries] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [status, setStatus] = useState("loading");

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  // Fetch all master habits
  useEffect(() => {
    const fetchAllHabits = async () => {
      try {
        setStatus("loading");
        const fetchedHabits = await apiHabits.getAllHabits();
        setHabits(fetchedHabits || []);
        setStatus("success");
      } catch (error) {
        console.error("Failed to fetch habits:", error);
        setStatus("error");
      }
    };
    fetchAllHabits();
  }, []);

  // Fetch entries for the current habits and month
  const fetchAllEntries = useCallback(async () => {
    if (habits.length === 0 || status !== "success") return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(Date.UTC(year, month, 1)).toISOString();
    const endDate = new Date(
      Date.UTC(year, month + 1, 0, 23, 59, 59)
    ).toISOString();

    const entriesMap = {};
    await Promise.all(
      habits.map(async (habit) => {
        try {
          const habitEntries = await apiHabits.getEntriesForHabit(
            habit._id,
            startDate,
            endDate
          );
          entriesMap[habit._id] = habitEntries;
        } catch (error) {
          console.error(
            `Failed to fetch entries for habit ${habit.title}`,
            error
          );
          entriesMap[habit._id] = [];
        }
      })
    );
    setEntries(entriesMap);
  }, [habits, currentDate, status]);

  useEffect(() => {
    fetchAllEntries();
  }, [fetchAllEntries]);

  // --- NEW: CALL ANALYTICS HOOK ---
  const { perHabitStats, overallStats } = useHabitAnalytics(
    habits,
    entries,
    currentDate
  );

  const handleMonthChange = (offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  const handleHabitAdded = (newHabit) => {
    setHabits((prev) => [...prev, newHabit]);
    setEntries((prev) => ({ ...prev, [newHabit._id]: [] }));
  };

  const handleHabitUpdated = (updatedHabit) =>
    setHabits((prev) =>
      prev.map((h) => (h._id === updatedHabit._id ? updatedHabit : h))
    );

  const handleHabitDeleted = (deletedHabitId) => {
    setHabits((prev) => prev.filter((h) => h._id !== deletedHabitId));
    setEntries((prev) => {
      const newEntries = { ...prev };
      delete newEntries[deletedHabitId];
      return newEntries;
    });
  };

  const openEditModal = (habit) => {
    setSelectedHabit(habit);
    setEditModalOpen(true);
  };

  const developHabits = useMemo(
    () => habits.filter((h) => h.habitType === "develop" && !h.isDeleted),
    [habits]
  );
  const quitHabits = useMemo(
    () => habits.filter((h) => h.habitType === "quit" && !h.isDeleted),
    [habits]
  );

  // --- EDITED RENDER SECTION ---
  return (
    <div className="p-4 md:p-8 min-h-screen text-gray-300">
      <GlobalStyles />
      <HeaderControls
        onAddNew={() => setAddModalOpen(true)}
        currentDate={currentDate}
        onMonthChange={handleMonthChange}
      />
      {status === "loading" && (
        <div className="text-center py-10">Loading habits...</div>
      )}
      {status === "error" && (
        <div className="text-center py-10 text-red-400">
          Failed to load habits. Please try again later.
        </div>
      )}
      {status === "success" && (
        <div className="space-y-8">
          {/* --- NEW DASHBOARD --- */}
          <OverallDashboard stats={overallStats} />

          {/* --- READ-ONLY GRIDS (No change) --- */}
          <HabitGrid
            title="Develop Habits"
            habits={developHabits}
            entries={entries}
            currentDate={currentDate}
          />
          <HabitGrid
            title="Quit Habits"
            habits={quitHabits}
            entries={entries}
            currentDate={currentDate}
            isQuitHabit={true}
          />

          {/* --- NEW ANALYTICS CARDS (Replaces old list) --- */}
          <HabitAnalytics
            title="Habit Analytics & Management"
            habits={habits.filter((h) => !h.isDeleted)}
            stats={perHabitStats}
            onEdit={openEditModal}
          />

          {/* --- Individual Habit Calendars --- */}
<div className="mt-12 w-full max-w-6xl mx-auto flex flex-wrap justify-center gap-8">
  {habits.filter(h => !h.isDeleted).map((habit) => {
    const habitEntries = entries[habit._id] || [];
    const markedDates = habitEntries
      .filter(e => e.done)
      .map(e => e.date);

    return (
      <div
        key={habit._id}
        className="glass-card flex flex-col items-center justify-start p-6 w-full sm:w-[300px] md:w-[320px] lg:w-[340px] text-center rounded-2xl transition-transform hover:scale-[1.02]"
      >
        <h2 className="text-white text-lg font-semibold mb-4">
          {habit.title}
        </h2>
        <Calendar
          markedDates={markedDates}
          markedColor={habit.habitType === "quit" ? "#E63946" : "#6CAA67"}
          onClick={(date) => console.log(`Clicked ${habit.title} date:`, date)}
        />
      </div>
    );
  })}
</div>

        </div>
      )}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onHabitAdded={handleHabitAdded}
      />
      <EditHabitModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        habit={selectedHabit}
        onHabitUpdated={handleHabitUpdated}
        onHabitDeleted={handleHabitDeleted}
      />
    </div>
  );
}
