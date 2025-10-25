import React, { useState, useEffect } from "react";
import api from "../api/EntryCalls";
import { useDispatch, useSelector } from "react-redux";
import { toggleEditForm, setDate } from "../redux/slices/formSlice";
import { editEntry, deleteEntry } from "../redux/slices/entrySlice";
import MoodSelector from "./MoodSelector";
import { X, Check, AlertTriangle, Trash2, Loader2, Save } from 'lucide-react'; // Import lucide icons

// --- Journal Edit Form Modal Component ---
const JournalEditFormModal = () => {
  const allEntries = useSelector((state) => state.entry.entries);
  const selDate = useSelector((state) => state.forms.date);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const [currentEntry, setCurrentEntry] = useState(null);
  const [formData, setFormData] = useState({
    feelingScore: null,
    achievement: "",
    timeWastedMinutes: 0,
    timeWastedNotes: "",
    sleepHours: 0,
    sleepNotes: "",
    diaryEntry: "",
  });

  const [submitting, setSubmitting] = useState(false);
  // Replaced `message` with `feedback` for inline control
  const [feedback, setFeedback] = useState({ type: null, message: null }); 

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false); // State for delete loading

  const todayFormatted = new Date().toISOString().split("T")[0];
  const minDate = new Date("2006-12-06");

  // Effect to find the entry and populate the form when the selected date or entries change
  useEffect(() => {
    setFeedback({ type: null, message: null }); // Clear feedback on date change
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
          feelingScore: foundEntry.feelingScore,
          achievement: foundEntry.achievement,
          timeWastedMinutes: foundEntry.timeWastedMinutes,
          timeWastedNotes: foundEntry.timeWastedNotes,
          sleepHours: foundEntry.sleepHours,
          sleepNotes: foundEntry.sleepNotes,
          diaryEntry: foundEntry.diaryEntry,
        });
      } else {
        setCurrentEntry(null);
        // Reset form to empty state if no entry is found
        setFormData({
          feelingScore: null,
          achievement: "",
          timeWastedMinutes: 0,
          timeWastedNotes: "",
          sleepHours: 0,
          sleepNotes: "",
          diaryEntry: "",
        });
        setFeedback({ type: "warning", message: "No entry found for this date. Cannot edit." });
      }
    }
  }, [selDate, allEntries]);

  // Date validation effect
  useEffect(() => {
    if (!selDate) return;
    const selectedDate = new Date(selDate);
    // Only show date validation if there's no success/error feedback from save/delete
    if (!feedback.type) { 
        if (selectedDate > new Date()) {
          setFeedback({ type: "error", message: "Can't set date to the future." });
        } else if (selectedDate < minDate) {
          setFeedback({ type: "error", message: "Bsdk tu paida hi nahi hua tha, how can you log?" });
        } else {
          setFeedback({ type: null, message: null });
        }
    }
  }, [selDate, feedback.type]);

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
      setFeedback({ type: "error", message: "Cannot save, no entry to edit." });
      return;
    }
    if(submitting) return;

    setSubmitting(true);
    setFeedback({ type: null, message: null });

    const updatedEntry = {
      ...currentEntry,
      ...formData,
      user: user._id, // Ensure user ID is passed
      date: selDate,
    };

    try {
      // API call to update the entry
      await api.updateEntry(currentEntry._id, updatedEntry); 
      
      // Update Redux state with the new data
      dispatch(editEntry({ id: currentEntry._id, updatedEntry }));
      
      setFeedback({ type: "success", message: "Entry updated successfully! Closing..." });
      
      // Close the modal after a short success display
      setTimeout(() => dispatch(toggleEditForm()), 1000); 

    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Failed to update entry. Please check the required fields.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmInput !== confirmationSignature || !currentEntry) {
        setFeedback({ type: "error", message: "Confirmation phrase does not match." });
        return;
    }

    setDeleting(true);
    setFeedback({ type: null, message: null });

    try {
      await api.deleteEntry(currentEntry._id);
      dispatch(deleteEntry(currentEntry._id));
      
      setFeedback({ type: "success", message: "Entry deleted successfully! Closing..." });
      
      // Clear local storage date to prevent immediate refetching the deleted entry
      dispatch(setDate(new Date().toISOString().split('T')[0])); 
      
      // Close after a short success display
      setTimeout(() => dispatch(toggleEditForm()), 1000);

    } catch (error) {
      setFeedback({ type: "error", message: "Failed to delete entry." });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const getFormattedDateForSignature = (dateString) => {
    if (!dateString) return "";
    // Note: The original logic for confirmation signature relies on a date string without time
    const date = new Date(dateString + "T00:00:00"); 
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  // Generate the required signature phrase based on the selected date
  const confirmationSignature = `Delete Entry for ${getFormattedDateForSignature(selDate)}`;

  const formInputStyle =
    "w-full p-2 rounded-md bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-teal-400 placeholder-gray-400 border border-gray-500 transition-colors";
  const formLabelStyle = "block text-sm font-medium text-white mb-1";
  const sectionTitleStyle = "text-md font-semibold text-teal-400 mb-4";
  const sectionDividerStyle = "border-t border-gray-700 my-6";

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50 transition-opacity duration-300"
      onClick={() => {if (!submitting && !deleting) dispatch(toggleEditForm())}} // Prevent closing while submitting/deleting
    >
      
      {/* --- Delete Confirmation Modal --- */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-2xl p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white/10 backdrop-blur-lg border border-red-500 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4"><Trash2 size={24}/> Confirm Deletion</h3>
            <p className="text-gray-300 my-4 text-sm md:text-base">
              This action cannot be undone. You are about to permanently delete the entry for{" "}
              <strong>
                {new Date(selDate + "T00:00:00").toLocaleDateString("en-US", {
                  dateStyle: "long",
                })}
              </strong>.
            </p>
            <p className="text-gray-400 text-xs mb-3">
              To confirm, please type the following exactly:
              <br />
              <code className="text-amber-400 font-mono bg-gray-700/50 p-1 rounded block mt-1 select-all text-sm">
                {confirmationSignature}
              </code>
            </p>
            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800/70 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              placeholder="Type the confirmation phrase here..."
              disabled={deleting}
            />
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                    if (!deleting) {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmInput("");
                    }
                }}
                className="py-2 px-4 rounded-lg text-white font-semibold transition duration-300 bg-gray-600/50 hover:bg-gray-500/50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmInput !== confirmationSignature || deleting}
                className="py-2 px-4 rounded-lg text-white font-bold transition duration-300 bg-red-600 hover:bg-red-700 flex items-center gap-2 disabled:bg-red-800/50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Deleting...
                  </>
                ) : (
                    'Permanently Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Edit Form Modal --- */}
      <div
        className="relative bg-white/10 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 transform transition-transform scale-100 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {if (!submitting && !deleting) dispatch(toggleEditForm())}}
          className="absolute top-4 right-4 text-gray-300 hover:text-red-400 transition-colors"
          aria-label="Close modal"
          disabled={submitting || deleting}
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-teal-400 mb-6 text-center">
          Edit Daily Entry
        </h2>

        {/* --- Inline Feedback Display --- */}
        {feedback.message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
              feedback.type === 'success'
                ? 'bg-green-900/50 text-green-300'
                : feedback.type === 'error'
                ? 'bg-red-900/50 text-red-300'
                : 'bg-yellow-900/50 text-yellow-300' // For warnings like "No entry found"
            }`}
          >
            {feedback.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
            <p className="font-medium">{feedback.message}</p>
          </div>
        )}

        {currentEntry && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Date Picker */}
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
                  disabled={submitting}
                />
              </div>
            </div>
            
            {/* Daily Summary */}
            <div>
              <h3 className={sectionTitleStyle}>Daily Summary</h3>
              <div className="border-t border-gray-700 my-4" />
              <div>
                <label className={formLabelStyle}>Mood Score (1 - 10)</label>
                <div className="mt-2">
                  <MoodSelector
                    selectedMood={formData.feelingScore}
                    setSelectedMood={(score) =>
                      setFormData((prev) => ({ ...prev, feelingScore: score }))
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-4 mt-4">
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
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Habits & Activities */}
            <div>
              <h3 className={sectionTitleStyle}>Habits & Activities</h3>
              <div className="border-t border-gray-700 my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    disabled={submitting}
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
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="space-y-4 mt-4">
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
                    disabled={submitting}
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
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Journal Entry */}
            <div>
              <h3 className={sectionTitleStyle}>Journal Entry</h3>
              <div className="border-t border-gray-700 my-4" />
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
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between space-x-4 pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="py-3 px-6 rounded-lg text-white font-bold transition duration-300 bg-red-600 hover:bg-red-700 flex items-center gap-2"
                disabled={submitting}
              >
                <Trash2 size={20}/> Delete
              </button>
              <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => {if (!submitting) dispatch(toggleEditForm())}}
                    className="py-3 px-6 rounded-lg text-white font-bold transition duration-300 bg-gray-600/50 hover:bg-gray-500/50"
                    disabled={submitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={`py-3 px-6 rounded-lg text-white font-bold transition duration-300 flex items-center gap-2 ${
                        submitting || feedback.type === 'success'
                        ? "bg-teal-700/50 cursor-not-allowed"
                        : "bg-teal-600 hover:bg-teal-500"
                    }`}
                    disabled={submitting || feedback.type === 'success'}
                >
                    {submitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" /> Saving...
                        </>
                    ) : feedback.type === 'success' ? (
                        <>
                            <Check size={20} /> Saved!
                        </>
                    ) : (
                        <>
                            <Save size={20} /> Save Changes
                        </>
                    )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JournalEditFormModal;