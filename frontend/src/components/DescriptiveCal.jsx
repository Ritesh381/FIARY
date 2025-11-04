import { useEffect, useState, useRef } from "react";
import Counter from "../ui/Counter";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setDate, toggleEditForm } from "../redux/slices/formSlice";
import { setEntryDate } from "../redux/slices/entryFormSlice";
import api from "../api/EntryCalls";
import { RiSparklingLine } from "react-icons/ri";
import { speakText, stopSpeaking } from "../config/speech";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

function DescriptiveCal() {
  const allEntries = useSelector((state) => state.entry.entries);
  const dateFromRedux = useSelector((state) => state.forms.date);
  const dispatch = useDispatch();
  const navigator = useNavigate();

  const [speakingKey, setSpeakingKey] = useState(null);
  const utteranceRef = useRef(null);

  const formatDateKey = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [currentDate, setCurrentDate] = useState(() => {
    if (dateFromRedux) {
      return new Date(dateFromRedux);
    }
    return new Date();
  });

  const [items, setItems] = useState({});
  const [isDayEditing, setIsDayEditing] = useState(false);
  const [isYearEditing, setIsYearEditing] = useState(false);
  const [tempDayInput, setTempDayInput] = useState(currentDate.getDate());
  const [tempYearInput, setTempYearInput] = useState(currentDate.getFullYear());

  const [aiActive, setAiActive] = useState(false);
  const [aiInsightsByDate, setAiInsightsByDate] = useState({});
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const newDate = dateFromRedux ? new Date(dateFromRedux) : currentDate;
    if (newDate.getTime() !== currentDate.getTime()) {
      setCurrentDate(newDate);
    }
    setTempDayInput(newDate.getDate());
    setTempYearInput(newDate.getFullYear());
    const normalizedCurrentDate = new Date(newDate);
    normalizedCurrentDate.setHours(0, 0, 0, 0);

    const entryForDay = allEntries.find((entry) => {
      const entryDate = new Date(entry.date || entry.createdAt);
      const normalizedEntryDate = new Date(entryDate);
      normalizedEntryDate.setHours(0, 0, 0, 0);
      return normalizedEntryDate.getTime() === normalizedCurrentDate.getTime();
    });

    setItems(entryForDay || {});

    // Manage AI state based on the new date
    const dateKey = formatDateKey(newDate);
    if (aiInsightsByDate[dateKey]) {
      setAiActive(true);
    } else {
      // If we switch to a new day, deactivate AI view unless data is pre-loaded
      if (new Date(dateFromRedux).getTime() !== new Date(currentDate).getTime()) {
        setAiActive(false);
      }
    }
  }, [dateFromRedux, allEntries, aiInsightsByDate, currentDate]);

  // Handle AIButton click toggle
  const handleAiToggle = async () => {
    const dateKey = formatDateKey(currentDate);

    // If AI is currently active, clicking the button should just toggle it off
    if (aiActive) {
        setAiActive(false);
        return;
    }

    // If AI is inactive and we click it, set it active first
    setAiActive(true);

    if (aiInsightsByDate[dateKey]) {
      return;
    }

    if (!items._id) {
      setAiActive(false); // Can't proceed, toggle back
      return;
    }

    setLoadingAI(true);
    try {
      const data = await api.dailyInsights(items._id);
      setAiInsightsByDate((prev) => ({
        ...prev,
        [dateKey]: data,
      }));
    } catch (err) {
      console.error("Failed to fetch AI insight:", err);
      setAiActive(false);
    } finally {
      setLoadingAI(false);
    }
  };

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    dispatch(setDate(formatDateKey(newDate)));
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    dispatch(setDate(formatDateKey(newDate)));
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
    dispatch(setDate(formatDateKey(newDate)));
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
      dispatch(setDate(formatDateKey(newDate)));
    }
    setIsDayEditing(false);
  };

  const handleYearUpdate = () => {
    const newYear = parseInt(tempYearInput, 10);
    const currentYear = new Date().getFullYear();
    if (!isNaN(newYear) && newYear >= 2000 && newYear <= currentYear + 5) {
      const newDate = new Date(currentDate);
      newDate.setFullYear(newYear);
      dispatch(setDate(formatDateKey(newDate)));
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

  const currentDateKey = formatDateKey(currentDate);
  const aiData = aiInsightsByDate[currentDateKey];

  const AIButton = () => (
    <div
      className={`relative rounded-full p-[2px] transition-all duration-300 ease-in-out
        ${
          aiActive
            ? "bg-gradient-to-r from-blue-500 to-purple-500"
            : "bg-transparent"
        }`}
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
        title={
          Object.keys(items).length === 0
            ? "Log an entry to get AI insights"
            : aiActive
            ? "Show Daily Log"
            : "Get AI Insights"
        }
      >
        <RiSparklingLine
          className={`
            relative z-10 w-5 h-5 transition-transform duration-500 ease-in-out
            ${
              Object.keys(items).length > 0
                ? "group-hover:rotate-360 text-blue-500"
                : "text-gray-500"
            }
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

  const getDayOfWeek = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  const dayOfWeek = getDayOfWeek(currentDate);


  return (
    <div className="relative p-2 sm:p-8 text-white font-urbane w-full max-w-[100vw] overflow-hidden min-h-screen bg-gray-900">
      {/* Mobile-optimized navigation */}
      <nav className="flex flex-col sm:flex-row items-center gap-3 sm:gap-0 sm:justify-between p-2 sm:p-4 bg-gray-800 bg-opacity-90 rounded-xl shadow-xl backdrop-blur-md sticky top-0 z-20">
        
        {/* A. Action buttons (Left on desktop, order-2 on mobile) */}
        <div className="flex space-x-2 items-center order-2 sm:order-none">
          <button
            disabled={Object.keys(items).length === 0}
            className={`p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 z-10 text-white transform hover:scale-105 ${
              Object.keys(items).length > 0
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-gray-700/50 cursor-not-allowed text-gray-400"
            }`}
            onClick={() => {
              // Redirect to /entry in edit mode with the entry id, and set the entry date in the entry form state
              if (items && items._id) {
                // set the entry date in entry form (used by Entry page)
                dispatch(setEntryDate(currentDate.toISOString()));
                // navigate to Entry page with edit=true and id param
                navigator(`/entry?edit=true&id=${items._id}`);
              }
            }}
            title="Edit Entry"
          >
            <Pencil size={16} className="sm:w-5 sm:h-5" />
          </button>
          <AIButton />
        </div>

        {/* B. Date Selection (Center on all screens, order-0 on mobile) */}
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 lg:space-x-4 order-0 sm:order-none w-full sm:w-auto">
          <button
            onClick={handlePrevDay}
            className="p-1.5 sm:p-2 lg:p-3 hover:bg-gray-700 rounded-lg transition-colors"
            title="Previous Day"
          >
            <ChevronLeft size={16} className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />
          </button>

          {/* Mobile-optimized date display */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 bg-gray-700/80 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-xl shadow-inner border border-gray-600">
            {isDayEditing ? (
              <input
                type="number"
                value={tempDayInput}
                onChange={(e) => setTempDayInput(e.target.value)}
                onBlur={handleDayUpdate}
                onKeyDown={handleDayKeyDown}
                className="w-10 sm:w-12 bg-transparent text-center text-sm sm:text-base lg:text-lg focus:outline-none border-b border-blue-500"
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsDayEditing(true)}
                className="w-8 sm:w-10 lg:w-12 text-center cursor-pointer hover:text-blue-400 transition"
              >
                <Counter
                  value={currentDate.getDate()}
                  places={[10, 1]}
                  fontSize={window.innerWidth < 640 ? 16 : window.innerWidth < 1024 ? 20 : 24}
                  padding={2}
                />
              </div>
            )}

            <select
              value={currentDate.getMonth()}
              onChange={handleMonthChange}
              className="bg-transparent text-xs sm:text-sm lg:text-base font-medium cursor-pointer focus:outline-none appearance-none"
            >
              {getMonths().map((month) => (
                <option key={month.value} value={month.value} className="bg-gray-800 text-white">
                  {window.innerWidth < 640 ? month.label.substring(0, 3) : month.label}
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
                className="w-14 sm:w-16 bg-transparent text-center text-sm sm:text-base lg:text-lg focus:outline-none border-b border-blue-500"
                autoFocus
              />
            ) : (
              <div onClick={() => setIsYearEditing(true)} className="cursor-pointer hover:text-blue-400 transition">
                <Counter
                  value={currentDate.getFullYear()}
                  places={[1000, 100, 10, 1]}
                  fontSize={window.innerWidth < 640 ? 16 : window.innerWidth < 1024 ? 20 : 24}
                  padding={2}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 sm:p-2 lg:p-3 hover:bg-gray-700 rounded-lg transition-colors"
            title="Next Day"
          >
            <ChevronRight size={16} className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />
          </button>
        </div>
        
        {/* C. Day of the Week Display - Responsive placement as requested */}
        <div className="order-1 sm:order-none w-full sm:w-[88px] flex justify-center items-center py-1">
            <span className="text-lg sm:text-base font-bold text-white tracking-wide">
                {dayOfWeek}
            </span>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {aiActive ? (
          <motion.div
            key="ai-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-4 sm:mt-8 p-3 sm:p-6 bg-gray-800 bg-opacity-90 rounded-xl shadow-2xl min-h-[300px] text-white max-w-4xl mx-auto backdrop-blur-sm border border-purple-600/50"
          >
            <h2 className="text-2xl font-bold text-purple-400 mb-6 border-b border-purple-900 pb-2 flex items-center">
              <RiSparklingLine className="w-6 h-6 mr-2" /> AI Daily Insights
            </h2>
            {loadingAI ? (
              <div className="flex justify-center items-center h-48 text-xl text-purple-300 animate-pulse">
                Loading AI insights...
              </div>
            ) : aiData ? (
              <div className="grid gap-6">
                {Object.entries(aiData).map(([title, insight]) => (
                  <div
                    key={title}
                    className="bg-gray-900/80 p-4 rounded-xl shadow-inner border border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-purple-300 text-lg sm:text-xl">
                        {title}
                      </h3>
                      <button
                        onClick={() =>
                          speakingKey === title
                            ? stopSpeaking(setSpeakingKey, utteranceRef)
                            : speakText(
                                String(insight),
                                title,
                                setSpeakingKey,
                                utteranceRef
                              )
                        }
                        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                        title={speakingKey === title ? "Stop Reading" : "Read Insight"}
                      >
                        {speakingKey === title ? (
                          <VolumeX className="w-5 h-5 text-red-400" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-green-400" />
                        )}
                      </button>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-200 text-sm sm:text-base">
                      <ReactMarkdown>{String(insight)}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-48 text-xl text-gray-400">
                No AI insights available for this entry.
              </div>
            )}
          </motion.div>
        ) : Object.keys(items).length > 0 ? (
          <motion.div
            key="entry-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col mt-4 sm:mt-8 space-y-6 max-w-4xl mx-auto"
          >
            {/* 1. Day of the Week Header (Removed from here, now in Nav for better user experience) */}
            
            {/* 2. Key Metrics Summary Block - STACKED DESIGN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full p-4 sm:p-6 bg-gray-800/90 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm"
            >
              <h1 className="text-xl sm:text-2xl font-extrabold text-blue-400 mb-4 border-b pb-2 border-gray-700">
                Day's Key Metrics
              </h1>

              {/* Achievement */}
              <div className="mb-6 p-4 bg-gray-900/80 rounded-lg border border-gray-700 shadow-md">
                <h3 className="font-bold text-yellow-400 text-lg sm:text-xl flex items-center mb-1">
                  <RiSparklingLine className="w-5 h-5 mr-2 text-yellow-400" /> Achievement of the Day
                </h3>
                <p className="mt-2 text-gray-200 text-sm sm:text-base leading-relaxed">
                  {/* Displaying full achievement text as requested */}
                  {items.achievement}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sleep & Notes (Combined) */}
                <div className="p-4 bg-gray-900/80 rounded-lg border border-gray-700 shadow-md">
                  <h3 className="font-bold text-blue-400 text-lg sm:text-xl mb-1">
                    Sleep Summary
                  </h3>
                  <p className="mt-1 text-blue-300 text-xl font-mono">
                    {items.sleepHours} hours
                  </p>
                  <h4 className="font-semibold text-gray-400 mt-3 mb-1 text-sm sm:text-base">
                    Notes:
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {items.sleepNotes || "No specific notes provided."}
                  </p>
                </div>

                {/* Time Not Utilized & Notes (Combined) */}
                <div className="p-4 bg-gray-900/80 rounded-lg border border-gray-700 shadow-md">
                  <h3 className="font-bold text-red-400 text-lg sm:text-xl mb-1">
                    Time Not Utilized
                  </h3>
                  <p className="mt-1 text-red-300 text-xl font-mono">
                    {Math.floor(items.timeWastedMinutes / 60)}h{" "}
                    {items.timeWastedMinutes % 60}m
                  </p>
                  <h4 className="font-semibold text-gray-400 mt-3 mb-1 text-sm sm:text-base">
                    Notes:
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {items.timeWastedNotes || "No specific notes provided."}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3. Journal Entry Block - STACKED DESIGN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-full p-4 sm:p-6 bg-gray-800/90 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm"
            >
              <div className="flex justify-between items-center mb-3 sm:mb-4 border-b pb-2 border-gray-700">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Journal Deep Dive
                </h1>
                <button
                  onClick={() =>
                    speakingKey === "journal"
                      ? stopSpeaking(setSpeakingKey, utteranceRef)
                      : speakText(
                          items.diaryEntry || "No journal entry",
                          "journal",
                          setSpeakingKey,
                          utteranceRef
                        )
                  }
                  className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                  title={speakingKey === "journal" ? "Stop Reading" : "Read Journal"}
                >
                  {speakingKey === "journal" ? (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-green-400" />
                  )}
                </button>
              </div>
              <div className="prose prose-invert max-w-none text-gray-300 text-sm sm:text-base leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-4">{children}</p>
                    ),
                  }}
                >
                  {String(items.diaryEntry || "").replace(/\n/g, "  \n")}
                </ReactMarkdown>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="no-entry-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col mt-4 sm:mt-8 space-y-4 max-w-4xl mx-auto"
          >
            <div className="w-full p-6 bg-gray-800 bg-opacity-90 rounded-xl shadow-2xl min-h-[300px] flex items-center justify-center text-center backdrop-blur-sm border border-gray-700">
              <AnimatePresence>
                <motion.div
                  key="no-data"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentDate > new Date() ? (
                    <p className="text-xl sm:text-2xl text-gray-400 font-extralight">
                      🔮 Bro cannot see the future
                    </p>
                  ) : (
                    <div className="flex flex-col items-center">
                      <p className="text-xl sm:text-2xl text-gray-400 mb-6 font-extralight">
                        📅 Haven't logged for this date
                      </p>
                      <button
                        onClick={() => {
                          dispatch(setEntryDate(currentDate.toISOString()));
                          navigator("/entry");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Log This Day
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
