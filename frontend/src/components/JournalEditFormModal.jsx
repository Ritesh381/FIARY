import React, { useState, useEffect } from "react";
import api from "../api/EntryCalls";
import { useDispatch, useSelector } from "react-redux";
import { toggleEditForm, setDate } from "../redux/slices/formSlice"; // FIX: Added setDate
import { editEntry, deleteEntry } from "../redux/slices/entrySlice";

// --- Journal Edit Form Modal Component ---
const JournalEditFormModal = () => {
  // Get data from Redux store
  // FIX: Corrected useSelector calls
  const allEntries = useSelector((state) => state.entry.entries);
  const selDate = useSelector((state) => state.forms.date);

  // State to hold the specific entry found for the selected date
  const [currentEntry, setCurrentEntry] = useState(null);

  // State to manage form inputs, initialized with empty values
  const [feeling, setFeeling] = useState("");
  const [bestMoment, setBestMoment] = useState("");
  const [worstMoment, setWorstMoment] = useState("");
  const [achievement, setAchievement] = useState("");
  const [timeWastedMinutes, setTimeWastedMinutes] = useState(0);
  const [timeWastedNotes, setTimeWastedNotes] = useState("");
  const [sleepHours, setSleepHours] = useState(0.0);
  const [sleepNotes, setSleepNotes] = useState("");
  const [physicalActivity, setPhysicalActivity] = useState("");
  const [didMasturbate, setDidMasturbate] = useState(false);
  const [masturbationNotes, setMasturbationNotes] = useState("");
  const [didTakeBath, setDidTakeBath] = useState(false);
  const [diaryEntry, setDiaryEntry] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const todayFormatted = new Date().toISOString().split("T")[0];
  const minDate = new Date("2006-12-06");
  const dispatch = useDispatch();

  // Effect to find the entry and populate the form when the selected date or entries change
  useEffect(() => {
    if (selDate && allEntries) {
      // Use the selDate string directly for comparison
      const foundEntry = allEntries.find(
        (entry) =>
          (entry.date ? new Date(entry.date) : new Date(entry.createdAt))
            .toISOString()
            .split("T")[0] === selDate
      );

      if (foundEntry) {
        setCurrentEntry(foundEntry);
        setFeeling(foundEntry.feeling);
        setBestMoment(foundEntry.bestMoment);
        setWorstMoment(foundEntry.worstMoment);
        setAchievement(foundEntry.achievement);
        setTimeWastedMinutes(foundEntry.timeWastedMinutes);
        setTimeWastedNotes(foundEntry.timeWastedNotes);
        setSleepHours(foundEntry.sleepHours);
        setSleepNotes(foundEntry.sleepNotes);
        setPhysicalActivity(foundEntry.physicalActivity);
        setDidMasturbate(foundEntry.didMasturbate);
        setMasturbationNotes(foundEntry.masturbationNotes);
        setDidTakeBath(foundEntry.didTakeBath);
        setDiaryEntry(foundEntry.diaryEntry);
        setMessage(null);
      } else {
        setCurrentEntry(null);
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
        setMessage({ type: "error", text: "No entry found for this date." });
      }
    }
  }, [selDate, allEntries]); // Re-run this effect when the selected date or the entries list changes

  // Date validation effect
  // FIX: Use selDate from Redux instead of local state
  useEffect(() => {
    if (!selDate) return;
    const selectedDate = new Date(selDate);
    if (selectedDate > new Date()) {
      // Use new Date() directly
      setMessage({ type: "error", text: "Can't set date to future" });
    } else if (selectedDate < minDate) {
      setMessage({
        type: "error",
        text: "Bsdk tu paida hi nahi hua tha kaise log karega",
      });
    } else {
      setMessage(null);
    }
  }, [selDate]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentEntry) {
      setMessage({ type: "error", text: "Cannot save, no entry to edit." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const updatedEntry = {
      ...currentEntry, // Use spread operator to maintain original data
      feeling,
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
      // FIX: Use selDate from Redux
      date: selDate,
    };

    try {
      await api.updateEntry(currentEntry._id, updatedEntry);
      // FIX: Correct payload for editEntry reducer
      dispatch(editEntry({ id: currentEntry._id, updatedEntry }));
      setMessage({ type: "success", text: "Entry updated successfully!" });
      alert("Edited entry saved sucessfully");
      dispatch(toggleEditForm());
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update entry. Please check the required fields.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
setShowDeleteConfirm(true);
  };


  const handleConfirmDelete = async () => {
    if (deleteConfirmInput === confirmationSignature && currentEntry) {
      try {
        await api.deleteEntry(currentEntry._id);
        dispatch(deleteEntry(currentEntry._id));
        alert("Entry deleted successfully.");
        dispatch(toggleEditForm());
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete entry.' });
        setShowDeleteConfirm(false); // Close confirmation on error
      }
    }
  };

  const getFormattedDateForSignature = (dateString) => {
    if (!dateString) return "";
    // Use 'T00:00:00' to avoid timezone issues with `new Date()`
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const confirmationSignature = `Delete Entry for ${getFormattedDateForSignature(selDate)}`;

  const formInputStyle =
    "w-full p-2 rounded-md bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-white placeholder-gray-400 border border-gray-500 color-white";
  const formLabelStyle = "block text-sm font-medium text-white mb-1";
  const sectionTitleStyle = "text-md font-semibold text-white mb-4";
  const sectionDividerStyle = "border-t border-gray-600 my-6";

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50"
      onClick={() => dispatch(toggleEditForm())}
    >

{/* --- Delete Confirmation Modal --- */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-2xl"  onClick={(e) => e.stopPropagation()}>
              <div className="bg-gray-900 border border-red-500 rounded-lg p-8 m-4 max-w-md w-full">
                  <h3 className="text-xl font-bold text-red-500">Confirm Deletion</h3>
                  <p className="text-gray-300 my-4">
                      This action cannot be undone. The entry for{" "}
                      <strong>{new Date(selDate + 'T00:00:00').toLocaleDateString('en-US', { dateStyle: 'long' })}</strong>{" "}
                      will be gone forever.
                  </p>
                  <p className="text-gray-400 text-sm mb-2">
                      To confirm, please type the following exactly:
                      <br />
                      <code className="text-amber-400 font-mono bg-gray-700 p-1 rounded block mt-1">
                          {confirmationSignature}
                      </code>
                  </p>
                  <input
                      type="text"
                      value={deleteConfirmInput}
                      onChange={(e) => setDeleteConfirmInput(e.target.value)}
                      className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <div className="flex justify-end space-x-4 mt-6">
                      <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="py-2 px-4 rounded-md text-white font-semibold transition duration-300 bg-gray-600 hover:bg-gray-700"
                      >
                          Cancel
                      </button>
                      <button
                          onClick={handleConfirmDelete}
                          disabled={deleteConfirmInput !== confirmationSignature}
                          className="py-2 px-4 rounded-md text-white font-bold transition duration-300 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed"
                      >
                          Confirm Delete
                      </button>
                  </div>
              </div>
          </div>
        )}


      <div
        className="relative bg-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform scale-100 duration-300 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(toggleEditForm())}
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
          Edit Entry
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

        {currentEntry && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className={formLabelStyle}>Date</label>
                <input
                  type="date"
                  // FIX: Use selDate from Redux and dispatch an action to change it
                  value={selDate}
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
              <div className="space-y-4">
                <div>
                  <label className={formLabelStyle}>Feeling</label>
                  <input
                    type="text"
                    value={feeling}
                    onChange={(e) => setFeeling(e.target.value)}
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
                  <label className={formLabelStyle}>
                    Achievement of the Day
                  </label>
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
                    Time Wasted (minutes)
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
                  <label className={formLabelStyle}>Time Wasted Notes</label>
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

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => dispatch(toggleEditForm())}
                className="py-3 px-6 rounded-md text-white font-bold transition duration-300 bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="py-3 px-6 rounded-md text-white font-bold transition duration-300 bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
              <button
                type="submit"
                className={`py-3 px-6 rounded-md text-white font-bold transition duration-300 ${
                  submitting
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JournalEditFormModal;
