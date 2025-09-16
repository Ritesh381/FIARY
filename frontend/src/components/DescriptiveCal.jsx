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

function DescriptiveCal() {
  const allEntries = useSelector((state) => state.entry.entries);
  const dispatch = useDispatch();

  // Set the initial date based on whether today's entry exists
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
      return today; // Default to today if an entry exists
    } else {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      return yesterday; // Default to yesterday if no entry for today
    }
  });

  const [items, setItems] = useState({});
  const [isDayEditing, setIsDayEditing] = useState(false);
  const [isYearEditing, setIsYearEditing] = useState(false);
  const [tempDayInput, setTempDayInput] = useState(currentDate.getDate());
  const [tempYearInput, setTempYearInput] = useState(currentDate.getFullYear());

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

  const handelJournal = () => {
    dispatch(toggleSaveForm());
  };

  useEffect(() => {
    setTempDayInput(currentDate.getDate());
    setTempYearInput(currentDate.getFullYear());

    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    const dateToDispatch = `${year}-${month}-${day}`;

    dispatch(setDate(dateToDispatch));
  }, [currentDate, dispatch]);

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

  return (
    <div className="relative p-8 text-white font-urbane w-full">
      <nav className="flex items-center justify-between p-4 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg">
        <div>
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
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevDay}
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
            onChange={handleMonthChange}
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
            onClick={handleNextDay}
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
      {Object.keys(items).length > 0 ? (
        <div className="flex flex-col md:flex-row justify-around mt-8 space-y-8 md:space-y-0 md:space-x-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-1/2 p-6 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-4"
          >
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800 p-4 rounded-md shadow-inner"
            >
              <h3 className="font-bold text-gray-400">Time Wasted</h3>
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
          </motion.div>
          <div className="md:w-1/2 p-6 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Diary Entry</h1>
            <p className="text-gray-300">{items.diaryEntry}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-around mt-8 space-y-8 md:space-y-0 md:space-x-8">
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
                      onClick={handelJournal}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                      Log
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

export default DescriptiveCal;
