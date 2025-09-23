import React, { useState, useEffect } from "react";
import api from "../api/EntryCalls";
import { useDispatch, useSelector } from "react-redux";
import { toggleSaveForm, setDate } from "../redux/slices/formSlice";
import { addEntry } from "../redux/slices/entrySlice";
import MoodSelector from "./MoodSelector";

const JournalFormModal = () => {
  const [mood, setMood] = useState("");
  const [feelingScore, setFeelingScore] = useState(null);
  const [bestMoment, setBestMoment] = useState("");
  const [worstMoment, setWorstMoment] = useState("");
  const [achievement, setAchievement] = useState("");
  const [timeWastedMinutes, setTimeWastedMinutes] = useState(0);
  const [timeWastedNotes, setTimeWastedNotes] = useState("");
  const [sleepHours, setSleepHours] = useState(0);
  const [sleepNotes, setSleepNotes] = useState("");
  const [physicalActivity, setPhysicalActivity] = useState("");
  const [didMasturbate, setDidMasturbate] = useState(false);
  const [masturbationNotes, setMasturbationNotes] = useState("");
  const [didTakeBath, setDidTakeBath] = useState(false);
  const [diaryEntry, setDiaryEntry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const selDate = useSelector((state) => state.forms.date);
  const user = useSelector((state) => state.user.user);
  const todayFormatted = new Date().toISOString().split("T")[0];
  const minDate = new Date("2006-12-06");
  const dispatch = useDispatch();

  useEffect(() => {
    // FIX: Use the 'selDate' from Redux for validation.
    const selectedDate = new Date(selDate);

    // FIX: Use 'new Date()' for a proper date comparison.
    if (selectedDate > new Date()) {
      setMessage({ type: "error", text: "Can't set date to future" });
    } else if (selectedDate < minDate) {
      setMessage({
        type: "error",
        text: "Bsdk tu paida hi nahi hua tha kaise log karega",
      });
    } else {
      setMessage(null);
    }
    // FIX: Depend on the Redux state to re-run the effect.
  }, [selDate]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const newEntry = {
      user: user._id,
      feeling: mood,
      feelingScore,
      bestMoment,
      worstMoment,
      achievement,
      timeWastedMinutes,
      timeWastedNotes,
      sleepHours,
      sleepNotes,
      physicalActivity,
      didMasturbate,
      masturbationNotes,
      didTakeBath,
      diaryEntry,
      date: selDate,
    };

    try {
      await api.saveEntry(newEntry);
      dispatch(addEntry(newEntry));
      setFeeling("");
      setBestMoment("");
      setWorstMoment("");
      setAchievement("");
      setTimeWastedMinutes(0);
      setTimeWastedNotes("");
      setSleepHours(0);
      setSleepNotes("");
      setPhysicalActivity("");
      setDidMasturbate(false);
      setMasturbationNotes("");
      setDidTakeBath(false);
      setDiaryEntry("");
      dispatch(setDate(new Date().toISOString().split("T")[0]));

      alert("Entry saved successfully!");
      dispatch(toggleSaveForm());
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save entry. Please check the required fields.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formInputStyle =
    "w-full p-2 rounded-md bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-white placeholder-gray-400 border border-gray-500 color-white";
  const formLabelStyle = "block text-sm font-medium text-white mb-1";
  const sectionTitleStyle = "text-md font-semibold text-white mb-4";
  const sectionDividerStyle = "border-t border-gray-600 my-6";

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50"
      onClick={() => dispatch(toggleSaveForm())}
    >
      <div
        className="relative bg-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform scale-100 duration-300 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(toggleSaveForm())}
          className="absolute top-4 right-4 text-white hover:text-blue-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
          Create New Entry
        </h2>

        {message && (
          <div
            className={`p-4 rounded-md mb-4 ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className={formLabelStyle}>Date</label>
              <input
                type="date"
                // FIX: Connect the input value to the Redux state.
                value={selDate}
                // FIX: Dispatch an action to change the date in Redux.
                onChange={(e) => dispatch(setDate(e.target.value))}
                className={formInputStyle}
                required
                min="2006-12-06"
                max={todayFormatted}
              />
            </div>
          </div>
          <div>
            <h3 className={sectionTitleStyle}>Daily Summary</h3>
            <hr className={sectionDividerStyle} />
            <div>
              <label className={formLabelStyle}>Mood Score (1 - 10)</label>
              <div>
                <MoodSelector
                  selectedMood={feelingScore}
                  setSelectedMood={setFeelingScore}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={formLabelStyle}>Mood Description</label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className={formInputStyle}
                  placeholder="e.g., Happy, Stressed, Motivated"
                  required
                />
              </div>
              <div>
                <label className={formLabelStyle}>Best Moment</label>
                <textarea
                  value={bestMoment}
                  onChange={(e) => setBestMoment(e.target.value)}
                  className={formInputStyle}
                  rows="3"
                  placeholder="What was the best part of your day?"
                />
              </div>
              <div>
                <label className={formLabelStyle}>Worst Moment</label>
                <textarea
                  value={worstMoment}
                  onChange={(e) => setWorstMoment(e.target.value)}
                  className={formInputStyle}
                  rows="3"
                  placeholder="What was the worst part of your day?"
                />
              </div>
              <div>
                <label className={formLabelStyle}>Achievement of the Day</label>
                <textarea
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  className={formInputStyle}
                  rows="3"
                  placeholder="What you did today that made you very happy ?"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className={sectionTitleStyle}>Habits & Activities</h3>
            <hr className={sectionDividerStyle} />
            <div className="space-y-4">
              <div>
                <label className={formLabelStyle}>
                  Time Not Utilized (minutes)
                </label>
                <input
                  type="number"
                  value={timeWastedMinutes}
                  onChange={(e) =>
                    setTimeWastedMinutes(parseInt(e.target.value))
                  }
                  className={formInputStyle}
                  required
                />
              </div>
              <div>
                <label className={formLabelStyle}>
                  Time Not Utilized Notes
                </label>
                <textarea
                  value={timeWastedNotes}
                  onChange={(e) => setTimeWastedNotes(e.target.value)}
                  className={formInputStyle}
                  rows="2"
                  placeholder="What was the time wasted on?"
                />
              </div>
              <div>
                <label className={formLabelStyle}>Sleep (hours)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className={formInputStyle}
                  required
                />
              </div>
              <div>
                <label className={formLabelStyle}>Sleep Notes</label>
                <textarea
                  value={sleepNotes}
                  onChange={(e) => setSleepNotes(e.target.value)}
                  className={formInputStyle}
                  rows="2"
                  placeholder="Quality of sleep, dreams, etc."
                />
              </div>
              <div>
                <label className={formLabelStyle}>Physical Activity</label>
                <input
                  type="text"
                  value={physicalActivity}
                  onChange={(e) => setPhysicalActivity(e.target.value)}
                  className={formInputStyle}
                  placeholder="e.g., Gym, Run, Yoga"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={didMasturbate}
                    onChange={(e) => setDidMasturbate(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-white">
                    Did Masturbate
                  </label>
                </div>
                {didMasturbate && (
                  <div className="w-full">
                    <label className={formLabelStyle}>Notes</label>
                    <input
                      type="text"
                      value={masturbationNotes}
                      onChange={(e) => setMasturbationNotes(e.target.value)}
                      className={formInputStyle}
                      placeholder="Notes on masturbation"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={didTakeBath}
                  onChange={(e) => setDidTakeBath(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-white">
                  Did Take Bath
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className={sectionTitleStyle}>Journal Entry</h3>
            <hr className={sectionDividerStyle} />
            <div className="space-y-4">
              <div>
                <label className={formLabelStyle}>Diary Entry</label>
                <textarea
                  value={diaryEntry}
                  onChange={(e) => setDiaryEntry(e.target.value)}
                  className={formInputStyle}
                  rows="6"
                  placeholder="Write your full diary entry here..."
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-6 rounded-md text-white font-bold transition duration-300 ${
              submitting
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Entry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JournalFormModal;
