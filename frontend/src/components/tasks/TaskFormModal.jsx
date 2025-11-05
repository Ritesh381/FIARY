import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  Plus,
  X,
  Loader2,
  Calendar,
  Tag,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { createTodoEntry } from "../../redux/slices/todoSlice";

// Helper to get current date/time in YYYY-MM-DDTHH:mm format for min attribute
// This is used to prevent setting a date/time in the past
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

/**
 * TaskFormModal - Dedicated to creating a single, one-time todo entry.
 * All repeating task logic has been removed to align with the new backend schema.
 */
export default function TaskFormModal({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "", // The new field for the todo due date/time
    priority: "medium", // <-- new priority field (low | medium | high)
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFeedback({ type: null, message: null });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: null });

    if (!formData.title) {
      setFeedback({ type: "error", message: "Task Title is required." });
      return;
    }

    setSubmitting(true);

    // Prepare payload for createTodoEntry
    // Convert the HTML datetime-local string to an ISO string if present
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: formData.date ? new Date(formData.date).toISOString() : null,
      priority: formData.priority, // <-- include priority
    };

    try {
      await dispatch(createTodoEntry(payload)).unwrap();
      setFeedback({ type: "success", message: "Todo created successfully!" });

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        category: "",
        date: "",
        priority: "medium",
      });
      setTimeout(onClose, 1000);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to create Todo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="task-modal-backdrop"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50 transition-opacity duration-300"
      onClick={(e) => {
        if (e.target.id === "task-modal-backdrop") {
          onClose();
        }
      }}
    >
      <GlassCard
        className="relative w-full max-w-xs p-4 sm:p-5 transform transition-transform scale-100 duration-300 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors p-1"
          aria-label="Close modal"
          disabled={submitting}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-indigo-400 mb-4 text-center flex items-center justify-center gap-2 pt-2">
          <Plus size={20} /> Create New Todo
        </h2>

        {/* Inline Feedback Display */}
        {feedback.message && (
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

        <form onSubmit={handleFormSubmit} className="space-y-3">
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
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Meditate for 10 minutes (Required)"
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-gray-600 transition-colors"
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
              value={formData.category}
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
              value={formData.description}
              onChange={handleChange}
              rows="2"
              placeholder="Optional details"
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-gray-600 transition-colors resize-none"
              disabled={submitting}
            />
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-gray-600 transition-colors"
              disabled={submitting}
            >
              <option value="low">Low</option>
              <option value="medium">medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || feedback.type === "success"}
            className={`w-full py-2 px-4 rounded-lg text-white font-bold transition duration-300 flex items-center justify-center gap-2 text-sm ${
              submitting || feedback.type === "success"
                ? "bg-indigo-700/50 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creating...
              </>
            ) : feedback.type === "success" ? (
              <>
                <CheckCircle size={16} /> Success!
              </>
            ) : (
              <>
                <Plus size={16} /> Create Todo
              </>
            )}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
