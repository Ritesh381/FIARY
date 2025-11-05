import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Loader2,
  Calendar,
  Tag,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
} from "lucide-react";
import {
  closeEditModal,
  updateTodoEntry,
  deleteTodoEntry,
  fetchTodos,
} from "../../redux/slices/todoSlice";

// Helper to get current date/time in YYYY-MM-DDTHH:mm format for min attribute
const getMinDateTime = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

const GlassCard = ({ children, className = "", ...props }) => (
  <div
    {...props}
    className={`bg-white/10 backdrop-blur-lg border border-gray-700 rounded-xl shadow-xl ${className}`}
  >
    {children}
  </div>
);

export default function TaskEditModal() {
  const dispatch = useDispatch();
  const { isEditModalOpen, selectedTask } = useSelector((state) => state.todo);

  const [formData, setFormData] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: null });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Removed: deleteConfirmInput, setDeleteConfirmInput
  const [deleting, setDeleting] = useState(false);

  // --- Effect to Initialize Form Data ---
  useEffect(() => {
    if (selectedTask) {
      setFormData({
        _id: selectedTask._id,
        title: selectedTask.title || "",
        description: selectedTask.description || "",
        category: selectedTask.category || "",
        status: selectedTask.status || "pending",
        date: selectedTask.date
          ? new Date(selectedTask.date).toISOString().slice(0, 16)
          : "",
      });
      setFeedback({ type: null, message: null });
      setShowDeleteConfirm(false); // Reset confirmation state when task changes
    }
  }, [selectedTask]);

  // --- Form Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFeedback({ type: null, message: null });
  };

  // --- Main Update Logic ---
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: null });

    if (!formData.title) {
      setFeedback({ type: "error", message: "Task Title is required." });
      return;
    }

    setSubmitting(true);
    const { _id, status, ...updates } = formData;

    const dateToSubmit = updates.date
      ? new Date(updates.date).toISOString()
      : null;

    try {
      await dispatch(
        updateTodoEntry({
          id: _id,
          updates: {
            ...updates,
            date: dateToSubmit,
          },
        })
      ).unwrap();

      dispatch(fetchTodos());

      setFeedback({ type: "success", message: "Todo updated successfully!" });
      setTimeout(() => dispatch(closeEditModal()), 1000);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to update todo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete Logic ---
  const handleDeleteClick = () => {
    // Just show the confirmation modal
    setShowDeleteConfirm(true);
    setFeedback({ type: null, message: null });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setFeedback({ type: null, message: null });

    try {
      await dispatch(deleteTodoEntry(formData._id)).unwrap();
      dispatch(fetchTodos());

      setFeedback({ type: "success", message: "Todo deleted successfully!" });
      setTimeout(() => dispatch(closeEditModal()), 1000);
    } catch (error) {
      setFeedback({ type: "error", message: "Failed to delete todo." });
      // Keep confirmation modal open on failure
      setShowDeleteConfirm(true);
    } finally {
      setDeleting(false);
    }
  };

  // --- Dynamic Content & Helpers ---
  const deleteMessage =
    "Are you sure you want to delete this todo? This action cannot be undone.";

  // Removed confirmationSignature

  if (!isEditModalOpen || !selectedTask) return null;

  return (
    <div
      id="task-edit-modal-backdrop"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50 transition-opacity duration-300"
      onClick={(e) => {
        if (e.target.id === "task-edit-modal-backdrop") {
          dispatch(closeEditModal());
        }
      }}
    >
      {/* --- Delete Confirmation Modal (Simplified) --- */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-2xl p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white/10 backdrop-blur-lg border border-red-500 rounded-xl p-6 md:p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4">
              <Trash2 size={24} /> Delete Todo: {selectedTask.title}
            </h3>
            <p className="text-gray-300 my-4 text-sm font-medium">
              {deleteMessage}
            </p>

            {/* Inline Feedback Display within Confirmation Modal */}
            {feedback.message && feedback.type === "error" && (
              <div
                className={`flex items-center gap-2 p-2 rounded-lg mb-3 text-xs font-medium bg-red-900/50 text-red-300`}
              >
                <AlertTriangle size={16} />
                <p>{feedback.message}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  if (!deleting) setShowDeleteConfirm(false);
                }}
                className="py-2 px-3 rounded-lg text-white font-semibold transition bg-gray-600/50 hover:bg-gray-500/50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="py-2 px-3 rounded-lg text-white font-bold transition bg-red-600 hover:bg-red-700 flex items-center gap-1 text-sm disabled:bg-red-800/50"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Edit Form Modal --- */}
      <GlassCard
        className="relative w-full max-w-xs p-4 sm:p-5 transform transition-transform scale-100 duration-300 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(closeEditModal())}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors p-1"
          aria-label="Close modal"
          disabled={submitting}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-indigo-400 mb-4 text-center flex items-center justify-center gap-2 pt-2">
          <Edit3 size={20} /> Edit Todo
        </h2>

        {/* Inline Feedback Display */}
        {feedback.message &&
          feedback.type !== "error" && ( // Don't show error here if delete modal is open
            <div
              className={`flex items-center gap-2 p-2 rounded-lg mb-3 text-xs font-medium ${
                feedback.type === "success"
                  ? "bg-green-900/50 text-green-300"
                  : "bg-red-900/50 text-red-300"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <p>{feedback.message}</p>
            </div>
          )}

        <form onSubmit={handleUpdateSubmit} className="space-y-3">
          {/* Title Input */}
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-medium text-gray-300 mb-1"
            >
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-gray-600 transition-colors"
              required
              disabled={submitting}
            />
          </div>

          {/* Category Input */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1"
            >
              <Tag size={12} /> Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              placeholder="e.g., Health, Work"
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-gray-600 transition-colors"
              disabled={submitting}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-medium text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows="2"
              placeholder="Optional details"
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-gray-600 transition-colors resize-none"
              disabled={submitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-3 pt-3">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="py-2 px-3 rounded-lg text-white font-bold transition duration-300 bg-red-600 hover:bg-red-700 flex items-center gap-1 text-sm"
              disabled={submitting}
            >
              <Trash2 size={16} /> Delete
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => dispatch(closeEditModal())}
                className="py-2 px-3 rounded-lg text-white font-bold transition duration-300 bg-gray-600/50 hover:bg-gray-500/50 text-sm"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`py-2 px-3 rounded-lg text-white font-bold transition duration-300 flex items-center gap-1 text-sm ${
                  submitting || feedback.type === "success"
                    ? "bg-indigo-700/50 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500"
                }`}
                disabled={submitting || feedback.type === "success"}
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : feedback.type === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <Edit3 size={16} />
                )}
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
