import React, { useState, useEffect } from "react";
import api from "../api/EntryCalls";
import { useDispatch, useSelector } from "react-redux";
import { toggleEditForm, setDate } from "../redux/slices/formSlice";
import { editEntry, deleteEntry } from "../redux/slices/entrySlice";
import MoodSelector from "./MoodSelector";

// --- Journal Edit Form Modal Component ---
const JournalEditFormModal = () => {
  const allEntries = useSelector((state) => state.entry.entries);
  const selDate = useSelector((state) => state.forms.date);
  const user = useSelector((state) => state.user.user);

  const [currentEntry, setCurrentEntry] = useState(null);
  const [formData, setFormData] = useState({
    mood: "",
    feelingScore: null,
    bestMoment: "",
    worstMoment: "",
    achievement: "",
    timeWastedMinutes: 0,
    timeWastedNotes: "",
    sleepHours: 0,
    sleepNotes: "",
    physicalActivity: "",
    didMasturbate: false,
    masturbationNotes: "",
    didTakeBath: false,
    diaryEntry: "",
  });

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
      const foundEntry = allEntries.find(
        (entry) =>
          (entry.date ? new Date(entry.date) : new Date(entry.createdAt))
            .toISOString()
            .split("T")[0] === selDate
      );

      if (foundEntry) {
        setCurrentEntry(foundEntry);
        setFormData({
          mood: foundEntry.feeling,
          feelingScore: foundEntry.feelingScore,
          bestMoment: foundEntry.bestMoment,
          worstMoment: foundEntry.worstMoment,
          achievement: foundEntry.achievement,
          timeWastedMinutes: foundEntry.timeWastedMinutes,
          timeWastedNotes: foundEntry.timeWastedNotes,
          sleepHours: foundEntry.sleepHours,
          sleepNotes: foundEntry.sleepNotes,
          physicalActivity: foundEntry.physicalActivity,
          didMasturbate: foundEntry.didMasturbate,
          masturbationNotes: foundEntry.masturbationNotes,
          didTakeBath: foundEntry.didTakeBath,
          diaryEntry: foundEntry.diaryEntry,
        });
        setMessage(null);
      } else {
        setCurrentEntry(null);
        setFormData({
          mood: "",
          feelingScore: null,
          bestMoment: "",
          worstMoment: "",
          achievement: "",
          timeWastedMinutes: 0,
          timeWastedNotes: "",
          sleepHours: 0,
          sleepNotes: "",
          physicalActivity: "",
          didMasturbate: false,
          masturbationNotes: "",
          didTakeBath: false,
          diaryEntry: "",
        });
        setMessage({ type: "error", text: "No entry found for this date." });
      }
    }
  }, [selDate, allEntries]);

  // Date validation effect
  useEffect(() => {
    if (!selDate) return;
    const selectedDate = new Date(selDate);
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
  }, [selDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentEntry) {
      setMessage({ type: "error", text: "Cannot save, no entry to edit." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const updatedEntry = {
      ...currentEntry,
      ...formData,
      user,
      date: selDate,
    };

    try {
      await api.updateEntry(currentEntry._id, updatedEntry);
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
        setMessage({ type: "error", text: "Failed to delete entry." });
        setShowDeleteConfirm(false);
      }
    }
  };

  const getFormattedDateForSignature = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const confirmationSignature = `Delete Entry for ${getFormattedDateForSignature(
    selDate
  )}`;

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
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gray-900 border border-red-500 rounded-lg p-8 m-4 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-500">Confirm Deletion</h3>
            <p className="text-gray-300 my-4">
              This action cannot be undone. The entry for{" "}
              <strong>
                {new Date(selDate + "T00:00:00").toLocaleDateString("en-US", {
                  dateStyle: "long",
                })}
              </strong>{" "}
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
              <div>
                <label className={formLabelStyle}>Mood Score (1 - 10)</label>
                <div>
                  <MoodSelector
                    selectedMood={formData.feelingScore}
                    setSelectedMood={(score) =>
                      setFormData((prev) => ({ ...prev, feelingScore: score }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={formLabelStyle}>Mood Description</label>
                  <input
                    type="text"
                    name="mood"
                    value={formData.mood}
                    onChange={handleChange}
                    className={formInputStyle}
                    placeholder="e.g., Happy, Stressed, Motivated"
                    required
                  />
                </div>
                <div>
                  <label className={formLabelStyle}>Best Moment</label>
                  <textarea
                    name="bestMoment"
                    value={formData.bestMoment}
                    onChange={handleChange}
                    className={formInputStyle}
                    rows="3"
                    placeholder="What was the best part of your day?"
                  />
                </div>
                <div>
                  <label className={formLabelStyle}>Worst Moment</label>
                  <textarea
                    name="worstMoment"
                    value={formData.worstMoment}
                    onChange={handleChange}
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
                    name="achievement"
                    value={formData.achievement}
                    onChange={handleChange}
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
                    name="timeWastedMinutes"
                    value={formData.timeWastedMinutes}
                    onChange={handleChange}
                    className={formInputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={formLabelStyle}>
                    Time Not Utilized Notes
                  </label>
                  <textarea
                    name="timeWastedNotes"
                    value={formData.timeWastedNotes}
                    onChange={handleChange}
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
                    name="sleepHours"
                    value={formData.sleepHours}
                    onChange={handleChange}
                    className={formInputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={formLabelStyle}>Sleep Notes</label>
                  <textarea
                    name="sleepNotes"
                    value={formData.sleepNotes}
                    onChange={handleChange}
                    className={formInputStyle}
                    rows="2"
                    placeholder="Quality of sleep, dreams, etc."
                  />
                </div>
                <div>
                  <label className={formLabelStyle}>Physical Activity</label>
                  <input
                    type="text"
                    name="physicalActivity"
                    value={formData.physicalActivity}
                    onChange={handleChange}
                    className={formInputStyle}
                    placeholder="e.g., Gym, Run, Yoga"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="didMasturbate"
                      checked={formData.didMasturbate}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-white">
                      Did Masturbate
                    </label>
                  </div>
                  {formData.didMasturbate && (
                    <div className="w-full">
                      <label className={formLabelStyle}>Notes</label>
                      <input
                        type="text"
                        name="masturbationNotes"
                        value={formData.masturbationNotes}
                        onChange={handleChange}
                        className={formInputStyle}
                        placeholder="Notes on masturbation"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="didTakeBath"
                    checked={formData.didTakeBath}
                    onChange={handleChange}
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
                    name="diaryEntry"
                    value={formData.diaryEntry}
                    onChange={handleChange}
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
