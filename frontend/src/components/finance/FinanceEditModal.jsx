import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Loader2,
  DollarSign,
  Tag,
  Calendar,
  Clock,
  NotepadText,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  closeEditModal,
  updateFinanceEntry,
  deleteFinanceEntry,
  fetchFinanceEntries,
} from "../../redux/slices/financeSlice";

const GlassCard = ({ children, className = "", ...props }) => (
  <div
    {...props}
    className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-gray-700 ${className}`}
  >
    {children}
  </div>
);

// Helper to format Decimal128 amount safely for display
const formatAmount = (amount) => {
  if (amount && typeof amount === "object" && amount.$numberDecimal) {
    return parseFloat(amount.$numberDecimal).toFixed(2);
  }
  if (typeof amount === "string" || typeof amount === "number") {
    return parseFloat(amount).toFixed(2);
  }
  return "";
};

// Helper to convert ISO date string to YYYY-MM-DDTHH:mm format for datetime-local input
const toDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper to get current date and time in YYYY-MM-DDTHH:mm format (used for max attribute)
const getCurrentLocalDatetime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper to find subcategories for a given category ID
const getSubcategories = (categories, categoryId) => {
  const category = categories.find((c) => c._id === categoryId);
  return category?.subcategories || [];
};

export default function FinanceEditModal() {
  const dispatch = useDispatch();
  const { isEditModalOpen, selectedEntry, categories } = useSelector(
    (state) => state.finance
  );
  const user = useSelector((state) => state.user.user);

  // Form state
  const [formData, setFormData] = useState({
    type: "Expense",
    amount: "",
    when: getCurrentLocalDatetime(),
    category_id: "",
    sub_category_id: "",
    note: "",
    _id: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: null });

  // Deletion states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- Category Filtering Logic ---
  const filteredCategories = useMemo(() => {
    const isExpenseType = formData.type === "Expense";
    return categories.filter((cat) => cat.isExpense === isExpenseType);
  }, [categories, formData.type]);

  // Effect to populate form when an entry is selected
  useEffect(() => {
    if (selectedEntry) {
      const entryCategoryId =
        selectedEntry.category_id?._id || selectedEntry.category_id || "";
      const entrySubcategoryId =
        selectedEntry.sub_category_id?._id ||
        selectedEntry.sub_category_id ||
        "";

      setFormData({
        type: selectedEntry.type,
        amount: formatAmount(selectedEntry.amount),
        when: toDatetimeLocal(selectedEntry.when), 
        category_id: entryCategoryId,
        sub_category_id: entrySubcategoryId,
        note: selectedEntry.note || "",
        _id: selectedEntry._id,
      });
      setFeedback({ type: null, message: null });
    }
  }, [selectedEntry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback({ type: null, message: null });

    if (name === "category_id") {
      setFormData((prev) => ({
        ...prev,
        category_id: value,
        sub_category_id: "",
      }));
    } else if (name === "type") {
      const isExpenseType = value === "Expense";
      const newFiltered = categories.filter(
        (cat) => cat.isExpense === isExpenseType
      );
      const newCategoryId = newFiltered[0] ? newFiltered[0]._id : "";

      setFormData((prev) => ({
        ...prev,
        type: value,
        category_id: newCategoryId,
        sub_category_id: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: null });
    if (
      !formData.amount ||
      !formData.category_id ||
      parseFloat(formData.amount) <= 0
    ) {
      setFeedback({
        type: "error",
        message: "Amount and Category are required.",
      });
      return;
    }

    setSubmitting(true);

    const selectedCategory = categories.find(
      (c) => c._id === formData.category_id
    );
    const selectedSubcategory = getSubcategories(
      categories,
      formData.category_id
    ).find((s) => s._id === formData.sub_category_id);

    // Convert the 'when' datetime-local string back to ISO format for the backend
    const updatedWhenISO = new Date(formData.when).toISOString();

    const payload = {
      category_id: formData.category_id,
      sub_category_id: formData.sub_category_id || null,
      category_name: selectedCategory?.name,
      sub_category_name: selectedSubcategory?.name,
      type: formData.type,
      when: updatedWhenISO,
      amount: parseFloat(formData.amount),
      note: formData.note,
    };

    try {
      await dispatch(
        updateFinanceEntry({ id: formData._id, updatedData: payload })
      ).unwrap();
      setFeedback({
        type: "success",
        message: "Entry updated successfully! Closing...",
      });

      dispatch(fetchFinanceEntries());
      setTimeout(() => dispatch(closeEditModal()), 1000);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to update entry.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Deletion Handlers ---
  const handleDeleteClick = () => {
    // Show the simpler confirmation overlay instead of the text input confirmation
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleting) return; // Prevent double click

    setDeleting(true);
    setFeedback({ type: null, message: null });

    try {
      await dispatch(deleteFinanceEntry(formData._id)).unwrap();
      setFeedback({
        type: "success",
        message: "Entry deleted successfully! Closing...",
      });

      dispatch(fetchFinanceEntries());
      setTimeout(() => dispatch(closeEditModal()), 1000);
    } catch (error) {
      setFeedback({ type: "error", message: "Failed to delete entry." });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };


  if (!isEditModalOpen || !selectedEntry) return null;

  const currentSubcategories = getSubcategories(
    categories,
    formData.category_id
  );

  return (
    <div
      id="finance-edit-modal-backdrop" 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50 transition-opacity duration-300"
      onClick={(e) => {
        if (e.target.id === "finance-edit-modal-backdrop") {
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
          <div className="bg-white/10 backdrop-blur-lg border border-red-500 rounded-xl p-6 max-w-xs w-full shadow-2xl"> {/* Reduced p-6, max-w-xs */}
            <h3 className="text-lg font-bold text-red-400 flex items-center gap-1 mb-3"> {/* Reduced font size and margin */}
              <Trash2 size={20} /> Confirm Deletion
            </h3>
            <p className="text-gray-300 my-3 text-sm"> {/* Reduced padding and font size */}
              You are about to permanently delete this transaction: 
              <br/>
              <span className="font-semibold text-white">
                {formData.type} of ₹{formatAmount(formData.amount)}
              </span>.
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3 mt-4"> {/* Reduced space and margin */}
              <button
                onClick={() => {
                  if (!deleting) setShowDeleteConfirm(false);
                }}
                className="py-2 px-3 rounded-lg text-white font-semibold transition duration-300 bg-gray-600/50 hover:bg-gray-500/50 text-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2 px-3 rounded-lg text-white font-bold transition duration-300 bg-red-600 hover:bg-red-700 flex items-center gap-1 text-sm disabled:bg-red-800/50 disabled:cursor-not-allowed"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  "Delete Forever"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Edit Form Modal --- */}
      <GlassCard
        className="relative w-full max-w-xs p-4 sm:p-5 transform transition-transform scale-100 duration-300 max-h-[95vh] overflow-y-auto" // Reduced width and padding
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(closeEditModal())}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors p-1" // Reduced padding
          aria-label="Close modal"
          disabled={submitting}
        >
          <X size={20} /> {/* Reduced icon size */}
        </button>

        <h2 className="text-xl font-bold text-teal-400 mb-4 text-center flex items-center justify-center gap-2 pt-1"> {/* Reduced font size and margin */}
          <Edit3 size={20} /> Edit Transaction
        </h2>

        {/* Inline Feedback Display */}
        {feedback.message && (
          <div
            className={`flex items-center gap-2 p-2 rounded-lg mb-3 text-xs font-medium ${ // Reduced padding and font size
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

        <form onSubmit={handleUpdateSubmit} className="space-y-3"> {/* Reduced spacing */}
          {/* Type Selector (Disabled in Edit) */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1"> {/* Reduced font size */}
              Transaction Type
            </label>
            <div className="flex gap-2 p-1 rounded-lg border border-gray-700 opacity-70 cursor-not-allowed"> {/* Reduced gap and padding */}
              <div
                className={`flex-1 py-1.5 rounded-lg font-medium text-xs flex items-center justify-center gap-1 ${ // Reduced padding/font size
                  formData.type === "Income"
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                <TrendingUp size={14} /> Income
              </div>
              <div
                className={`flex-1 py-1.5 rounded-lg font-medium text-xs flex items-center justify-center gap-1 ${ // Reduced padding/font size
                  formData.type === "Expense"
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                <TrendingDown size={14} /> Expense
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm"> {/* Reduced font size */}
              ₹
            </span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Amount (required)"
              min="0.01"
              step="0.01"
              className="w-full p-2 pl-8 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors" // Reduced padding and pl
              required
              disabled={submitting}
            />
          </div>

          {/* Date/Time Input */}
          <div>
            <label
              htmlFor="when"
              className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1" // Reduced font size and gap
            >
              <Calendar size={14} />
              <Clock size={14} /> Date and Time
            </label>
            <input
              type="datetime-local"
              id="when"
              name="when"
              value={formData.when}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors" // Reduced padding
              required
              max={getCurrentLocalDatetime()} 
              disabled={submitting}
            />
          </div>

          {/* Category Selector */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1" // Reduced font size and gap
            >
              <Tag size={14} /> Category (required)
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors" // Reduced padding
              required
              disabled={submitting || filteredCategories.length === 0}
            >
              {filteredCategories.length === 0 ? (
                <option value="">
                  No categories
                </option>
              ) : (
                filteredCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Subcategory Selector (Conditional) */}
          {currentSubcategories.length > 0 && (
            <div>
              <label
                htmlFor="sub_category_id"
                className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1" // Reduced font size and gap
              >
                <Tag size={14} /> Subcategory (optional)
              </label>
              <select
                id="sub_category_id"
                name="sub_category_id"
                value={formData.sub_category_id}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors" // Reduced padding
                disabled={submitting}
              >
                <option value="">-- None --</option>
                {currentSubcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Note Input */}
          <div>
            <label
              htmlFor="note"
              className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1" // Reduced font size and gap
            >
              <NotepadText size={14} /> Note (optional)
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="2"
              placeholder="Short description" // Shortened placeholder
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors resize-none" // Reduced padding
              disabled={submitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-3 pt-3"> {/* Reduced spacing and margin */}
            <button
              type="button"
              onClick={handleDeleteClick}
              className="py-2 px-3 rounded-lg text-white font-bold transition duration-300 bg-red-600 hover:bg-red-700 flex items-center gap-1 text-sm" // Reduced padding and font size
              disabled={submitting}
            >
              <Trash2 size={16} /> Delete
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => dispatch(closeEditModal())}
                className="py-2 px-3 rounded-lg text-white font-bold transition duration-300 bg-gray-600/50 hover:bg-gray-500/50 text-sm" // Reduced padding and font size
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`py-2 px-3 rounded-lg text-white font-bold transition duration-300 flex items-center justify-center gap-1 text-sm ${ // Reduced padding and font size
                  submitting || feedback.type === "success"
                    ? "bg-teal-700/50 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-500"
                }`}
                disabled={submitting || feedback.type === "success"}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : feedback.type === "success" ? (
                  <>
                    <CheckCircle size={16} /> Saved!
                  </>
                ) : (
                  <>
                    <Edit3 size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
