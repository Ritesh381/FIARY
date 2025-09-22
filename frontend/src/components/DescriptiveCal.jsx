import { useEffect, useState } from "react";
import Counter from "../ui/Counter";
import { ChevronLeft, ChevronRight, Droplet, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleSaveForm,
  setDate,
  toggleEditForm,
} from "../redux/slices/formSlice";
import api from "../api/EntryCalls";
import { RiSparklingLine } from "react-icons/ri"; // Import the icon

function DescriptiveCal() {
  const allEntries = useSelector((state) => state.entry.entries);
  const dispatch = useDispatch();

  // Set initial currentDate based on today's or yesterday's entry
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    const todayNormalized = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const hasTodayEntry = allEntries.some((entry) => {
      const entryDate = new Date(entry.date || entry.createdAt);
      const normalizedEntryDate = new Date(
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate()
      );
      return normalizedEntryDate.getTime() === todayNormalized.getTime();
    });

    if (hasTodayEntry) {
      return today;
    } else {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      return yesterday;
    }
  });

  const [items, setItems] = useState({});
  const [isDayEditing, setIsDayEditing] = useState(false);
  const [isYearEditing, setIsYearEditing] = useState(false);
  const [tempDayInput, setTempDayInput] = useState(currentDate.getDate());
  const [tempYearInput, setTempYearInput] = useState(currentDate.getFullYear());

  // AI mode state
  const [aiActive, setAiActive] = useState(false);
  const [aiInsightsByDate, setAiInsightsByDate] = useState({}); // { 'YYYY-MM-DD': { Title: "..."} }
  const [loadingAI, setLoadingAI] = useState(false);

  // Utility: format date to yyyy-mm-dd string key
  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Load entries on currentDate change
  useEffect(() => {
    const normalizedCurrentDate = new Date(currentDate);
    normalizedCurrentDate.setHours(0, 0, 0, 0);

    const entryForDay = allEntries.find((entry) => {
      const entryDate = new Date(entry.date || entry.createdAt);
      const normalizedEntryDate = new Date(entryDate);
      normalizedEntryDate.setHours(0, 0, 0, 0);
      return normalizedEntryDate.getTime() === normalizedCurrentDate.getTime();
    });

    setItems(entryForDay || {});
  }, [currentDate, allEntries]);

  // Dispatch date to redux and reset AI toggle as per cache on date change
  useEffect(() => {
    setTempDayInput(currentDate.getDate());
    setTempYearInput(currentDate.getFullYear());

    const dateKey = formatDateKey(currentDate);
    dispatch(setDate(dateKey));

    // If AI data exists for this date and was previously active, enable AI mode automatically,
    // otherwise reset aiActive to false
    if (aiInsightsByDate[dateKey]) {
      setAiActive(true);
    } else {
      setAiActive(false);
    }
  }, [currentDate, dispatch, aiInsightsByDate]);

  // Handle AIButton click toggle
  const handleAiToggle = async () => {
    const dateKey = formatDateKey(currentDate);
    
    // Toggle the state immediately to show loading or insights
    setAiActive(!aiActive);

    // If we're turning AI on
    if (!aiActive) {
      // If we already have AI insights cached, just return
      if (aiInsightsByDate[dateKey]) {
        return;
      }

      if (!items._id) {
        // No valid entry id to fetch for AI insights, so just return
        return;
      }
      
      setLoadingAI(true);
      try {
        const data = await api.dailyInsights(items._id);
        // Cache the AI insight for this date
        setAiInsightsByDate((prev) => ({
          ...prev,
          [dateKey]: data,
        }));

      } catch (err) {
        console.error("Failed to fetch AI insight:", err);
        // On failure, turn AI mode off and show an error message
        setAiActive(false);
      } finally {
        setLoadingAI(false);
      }
    }
  };


  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getMonths = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
    }));
  };

  const handleMonthChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value, 10));
    setCurrentDate(newDate);
  };

  const handleDayUpdate = () => {
    const newDay = parseInt(tempDayInput, 10);
    const maxDays = getDaysInMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    if (!isNaN(newDay) && newDay >= 1 && newDay <= maxDays) {
      const newDate = new Date(currentDate);
      newDate.setDate(newDay);
      setCurrentDate(newDate);
    }
    setIsDayEditing(false);
  };

  const handleYearUpdate = () => {
    const newYear = parseInt(tempYearInput, 10);
    const currentYear = new Date().getFullYear();
    if (!isNaN(newYear) && newYear >= 2000 && newYear <= currentYear + 5) {
      const newDate = new Date(currentDate);
      newDate.setFullYear(newYear);
      setCurrentDate(newDate);
    }
    setIsYearEditing(false);
  };

  const handleDayKeyDown = (e) => {
    if (e.key === "Enter") {
      handleDayUpdate();
      e.target.blur();
    }
  };

  const handleYearKeyDown = (e) => {
    if (e.key === "Enter") {
      handleYearUpdate();
      e.target.blur();
    }
  };

  // Safer utility function to truncate strings
  const truncateString = (str, num) => {
    if (typeof str !== "string" || !str) {
      return "";
    }
    if (str.length > num) {
      return str.slice(0, num) + "...";
    }
    return str;
  };

  // Format AI data display from cached object, if any
  const currentDateKey = formatDateKey(currentDate);
  const aiData = aiInsightsByDate[currentDateKey];

  // The AI Button logic is now inside this component
  const AIButton = () => (
    <div
      className={`relative rounded-full p-[2px] transition-all duration-300 ease-in-out
        ${aiActive ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-transparent"}`}
    >
      <button
        disabled={Object.keys(items).length === 0}
        onClick={handleAiToggle}
        className={`
          group relative flex items-center justify-center rounded-full p-2
          transition-all duration-300 ease-in-out 
          ${
            Object.keys(items).length > 0
              ? "cursor-pointer"
              : "cursor-not-allowed"
          }
          ${aiActive ? "bg-white" : "bg-transparent"}
          hover:scale-110
        `}
      >
        <RiSparklingLine
          className={`
            relative z-10 transition-transform duration-500 ease-in-out
            ${Object.keys(items).length > 0 ? "group-hover:rotate-360" : "text-gray-500"}
          `}
        />
        {!aiActive && (
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300 ease-in-out
              ${Object.keys(items).length === 0 ? "bg-gray-300" : ""}`}
          />
        )}
      </button>
    </div>
  );


  return (
    <div className="relative p-8 text-white font-urbane w-full">
      <nav className="flex items-center justify-between p-4 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg">
        <div className="flex space-x-2 items-center">
          <button
            disabled={Object.keys(items).length === 0}
            className={`p-3 rounded-full shadow-lg transition-colors duration-300 z-10 text-white
                      ${
                        Object.keys(items).length > 0
                          ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
            onClick={() => {
              if (Object.keys(items).length > 0) {
                dispatch(toggleEditForm());
              }
            }}
          >
            <Pencil size={24} />
          </button>
          {/* AI Button */}
          <AIButton />
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setAiActive(false); // Reset AI mode on manual date navigation
              handlePrevDay();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          {isDayEditing ? (
            <input
              type="number"
              value={tempDayInput}
              onChange={(e) => setTempDayInput(e.target.value)}
              onBlur={handleDayUpdate}
              onKeyDown={handleDayKeyDown}
              className="bg-gray-800 text-white border-none py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-16 text-center"
              autoFocus
            />
          ) : (
            <div onClick={() => setIsDayEditing(true)}>
              <Counter value={currentDate.getDate()} places={[10, 1]} />
            </div>
          )}
          <select
            name="month"
            id="month"
            value={currentDate.getMonth()}
            onChange={(e) => {
              setAiActive(false);
              handleMonthChange(e);
            }}
            className="bg-gray-800 text-white border-none py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-2xl"
          >
            {getMonths().map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          {isYearEditing ? (
            <input
              type="number"
              value={tempYearInput}
              onChange={(e) => setTempYearInput(e.target.value)}
              onBlur={handleYearUpdate}
              onKeyDown={handleYearKeyDown}
              className="bg-gray-800 text-white border-none py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-24 text-center"
              autoFocus
            />
          ) : (
            <div onClick={() => setIsYearEditing(true)}>
              <Counter
                value={currentDate.getFullYear()}
                places={[1000, 100, 10, 1]}
              />
            </div>
          )}
          <button
            onClick={() => {
              setAiActive(false);
              handleNextDay();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex space-x-2">
          <div className="text-2xl cursor-pointer">
            <Droplet
              size={24}
              className="text-gray-400"
              fill={items.didTakeBath ? "blue" : "none"}
            />
          </div>
          <div className="text-2xl cursor-pointer">
            <Droplet
              size={24}
              className="text-gray-400"
              fill={items.didMasturbate ? "white" : "none"}
            />
          </div>
        </div>
      </nav>

      {/* Content area */}
      <AnimatePresence mode="wait">
        {aiActive ? (
          // AI insights view
          <motion.div
            key="ai-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-8 p-6 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg min-h-[300px] text-white"
          >
            {loadingAI ? (
              <div className="flex justify-center items-center h-full text-xl text-gray-300">
                Loading AI insights...
              </div>
            ) : aiData ? (
              <div className="grid gap-6">
                {Object.entries(aiData).map(([title, insight]) => (
                  <div key={title} className="bg-gray-800 p-4 rounded-md shadow-inner">
                    <h3 className="font-bold text-gray-400 text-lg mb-1">{title}</h3>
                    <p className="text-white">{insight}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-full text-xl text-gray-300">
                No AI insights available.
              </div>
            )}
          </motion.div>
        ) : Object.keys(items).length > 0 ? (
          // Normal entry view
          <motion.div
            key="entry-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row justify-around mt-8 space-y-8 md:space-y-0 md:space-x-8"
          >
            <div className="md:w-1/2 p-6 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 p-4 rounded-md shadow-inner"
              >
                <h3 className="font-bold text-gray-400">Feeling</h3>
                <p className="text-xl mt-1">{items.feeling}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800 p-4 rounded-md shadow-inner"
              >
                <h3 className="font-bold text-gray-400">
                  Achievement of the Day
                </h3>
                <p className="mt-1">{truncateString(items.achievement, 200)}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 p-4 rounded-md shadow-inner"
              >
                <h3 className="font-bold text-gray-400">Best Moment</h3>
                <p className="mt-1">{truncateString(items.bestMoment, 200)}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 p-4 rounded-md shadow-inner"
              >
                <h3 className="font-bold text-gray-400">Worst Moment</h3>
                <p className="mt-1">{truncateString(items.worstMoment, 200)}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800 p-4 rounded-md shadow-inner"
              >
                <h3 className="font-bold text-gray-400">Time Not Utilized</h3>
                <p className="mt-1">
                  {Math.floor(items.timeWastedMinutes / 60)}h{" "}
                  {items.timeWastedMinutes % 60}m
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-800 p-4 rounded-md shadow-inner"
              >
                <h3 className="font-bold text-gray-400">Sleep</h3>
                <p className="mt-1">{items.sleepHours} hours</p>
              </motion.div>
            </div>
            <div className="md:w-1/2 p-6 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold mb-4">Journal Entry</h1>
              <p className="text-gray-300">{items.diaryEntry}</p>
            </div>
          </motion.div>
        ) : (
          // No entries view if not AI
          <motion.div
            key="no-entry-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row justify-around mt-8 space-y-8 md:space-y-0 md:space-x-8"
          >
            <div className="md:w-full p-6 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg min-h-[300px] flex items-center justify-center text-center">
              <AnimatePresence>
                <motion.div
                  key="no-data"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentDate > new Date() ? (
                    <p className="text-xl text-gray-400">
                      🔮 Bro cannot see the future
                    </p>
                  ) : (
                    <div className="flex flex-col items-center">
                      <p className="text-xl text-gray-400 mb-4">
                        📅 Haven't logged for this date
                      </p>
                      <button
                        onClick={() => dispatch(toggleSaveForm())}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                      >
                        Log
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DescriptiveCal;