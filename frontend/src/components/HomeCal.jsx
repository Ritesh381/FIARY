import { useEffect, useState } from "react";
import Counter from "../ui/Counter";
import { ChevronLeft, ChevronRight, Droplet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setDate, toggleForm } from "../redux/actions";

function HomeCal() {
  const allEntries = useSelector((state) => state.entries);
  const [bath, setBath] = useState(false);
  const [master, setMaster] = useState(false);
  const [items, setItems] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDayEditing, setIsDayEditing] = useState(false);
  const [isYearEditing, setIsYearEditing] = useState(false);
  const [tempDayInput, setTempDayInput] = useState(currentDate.getDate());
  const [tempYearInput, setTempYearInput] = useState(currentDate.getFullYear());
  const dispatch = useDispatch()

  useEffect(() => {
    const formattedDate = currentDate.toISOString().split("T")[0];
    const entryForDay = allEntries.find((entry) => {
      const entryDate = new Date(entry.date ? entry.date : entry.createdAt)
        .toISOString()
        .split("T")[0];
      return entryDate === formattedDate;
    });

    setItems(entryForDay || {});

    if (entryForDay) {
      setBath(entryForDay.didTakeBath);
      setMaster(entryForDay.didMasturbate);
    } else {
      setBath(false);
      setMaster(false);
    }
  }, [currentDate, allEntries, setBath, setMaster]);

  const handelJournal = () => {
    dispatch(toggleForm())
  };

  // Sync temp input values with currentDate when it changes from other controls
  useEffect(() => {
    setTempDayInput(currentDate.getDate());
    setTempYearInput(currentDate.getFullYear());
    dispatch(setDate(currentDate))
  }, [currentDate]);

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
    // Hide the input field
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
    // Hide the input field
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

  // Utility function to truncate strings
  const truncateString = (str, num) => {
    if (str.length > num) {
      return str.slice(0, num) + "...";
    }
    return str;
  };

  return (
    <div className="p-8 text-white font-sans w-full">
      <nav className="flex items-center justify-between p-4 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg">
        <div className="text-2xl cursor-pointer transition-transform duration-300 hover:scale-110">
          😀
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
              fill={bath ? "blue" : "none"}
            />
          </div>
          <div className="text-2xl cursor-pointer">
            <Droplet
              size={24}
              className="text-gray-400"
              fill={master ? "none" : "white"}
            />
          </div>
        </div>
      </nav>
      {/* Details */}
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
              <h3 className="font-bold text-gray-400">Goal Progress</h3>
              <p className="mt-1">{truncateString(items.goalProgress, 200)}</p>
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

export default HomeCal;
