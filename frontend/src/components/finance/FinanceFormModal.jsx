import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X, Loader2, DollarSign, Tag, Calendar, Clock, NotepadText, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { toggleAddModal, createFinanceEntry, fetchFinanceEntries } from "../../redux/slices/financeSlice";

// Helper to get current date and time in YYYY-MM-DDTHH:mm format
const getCurrentLocalDatetime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const GlassCard = ({ children, className = "", ...props }) => (
    <div {...props} className={`bg-white/10 backdrop-blur-lg border border-gray-700 rounded-xl shadow-xl ${className}`}>
        {children}
    </div>
);

// Helper to find subcategories for a given category ID
const getSubcategories = (categories, categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.subcategories || [];
};

export default function FinanceFormModal() {
    const dispatch = useDispatch();
    const { isAddModalOpen, categories } = useSelector(state => state.finance);
    const user = useSelector(state => state.user.user);

    // Form state
    const [formData, setFormData] = useState({
        type: 'Expense',
        amount: '',
        when: getCurrentLocalDatetime(), // Updated to include time
        category_id: '',
        sub_category_id: '',
        note: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, message: null });

    // --- Category Filtering Logic ---
    const filteredCategories = useMemo(() => {
        const isExpenseType = formData.type === 'Expense';
        return categories.filter(cat => cat.isExpense === isExpenseType);
    }, [categories, formData.type]);

    // Auto-select first category in filtered list (Fix: only run on modal open/type change)
    useEffect(() => {
        if (isAddModalOpen && filteredCategories.length > 0) {
            const isValidCategory = filteredCategories.some(cat => cat._id === formData.category_id);

            if (!isValidCategory) {
                const firstCategory = filteredCategories[0];
                const newCategoryId = firstCategory ? firstCategory._id : '';

                setFormData(prev => ({
                    ...prev,
                    category_id: newCategoryId,
                    sub_category_id: '' // Reset subcategory when category list changes
                }));
            }
        }
    }, [isAddModalOpen, filteredCategories, formData.category_id]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFeedback({ type: null, message: null });

        if (name === 'category_id') {
            // Standard category change, reset subcategory
            setFormData(prev => ({
                ...prev,
                category_id: value,
                sub_category_id: '',
            }));
        } else if (name === 'type') {
            // Type toggle: Find new filtered list immediately to determine new category_id default
            const isExpenseType = value === 'Expense';
            const newFiltered = categories.filter(cat => cat.isExpense === isExpenseType);
            const newCategoryId = newFiltered[0] ? newFiltered[0]._id : '';

            setFormData(prev => ({
                ...prev,
                type: value,
                category_id: newCategoryId,
                sub_category_id: '',
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: null, message: null });

        if (!formData.amount || !formData.category_id || parseFloat(formData.amount) <= 0) {
            setFeedback({ type: 'error', message: 'Amount and Category are required.' });
            return;
        }

        setSubmitting(true);

        // Convert the 'when' datetime-local string back to ISO format for the backend
        const updatedWhenISO = new Date(formData.when).toISOString();

        // Only send IDs, not names - backend will derive names from IDs
        const payload = {
            type: formData.type,
            category_id: formData.category_id,
            sub_category_id: formData.sub_category_id || null,
            when: updatedWhenISO,
            amount: parseFloat(formData.amount),
            note: formData.note,
            created_by: user._id,
        };

        try {
            await dispatch(createFinanceEntry(payload)).unwrap();
            setFeedback({ type: 'success', message: 'Entry saved successfully! Closing...' });

            dispatch(fetchFinanceEntries());

            // Reset form for next open/use
            const defaultExpenseCategory = categories.find(c => c.isExpense === true)?._id || '';

            setFormData({
                type: 'Expense',
                amount: '',
                when: getCurrentLocalDatetime(),
                category_id: defaultExpenseCategory, // Re-initialize to default Expense category
                sub_category_id: '',
                note: '',
            });
            setTimeout(() => dispatch(toggleAddModal()), 1000);

        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Failed to save entry.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAddModalOpen) return null;

    const currentSubcategories = getSubcategories(categories, formData.category_id);

    return (
        <div
            id="finance-modal-backdrop" // ID for robust backdrop click check
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50 transition-opacity duration-300"
            onClick={(e) => {
                if (e.target.id === 'finance-modal-backdrop') {
                    dispatch(toggleAddModal());
                }
            }}
        >
            <GlassCard
                className="relative w-full max-w-xs p-4 sm:p-5 transform transition-transform scale-100 duration-300 max-h-[95vh] overflow-y-auto" // Reduced width and padding
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => dispatch(toggleAddModal())}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors p-1" // Reduced padding
                    aria-label="Close modal"
                    disabled={submitting}
                >
                    <X size={20} /> {/* Reduced icon size */}
                </button>

                <h2 className="text-xl font-bold text-teal-400 mb-4 text-center flex items-center justify-center gap-2 pt-1"> {/* Reduced font size and margin */}
                    <Plus size={20} /> Log New Transaction
                </h2>

                {/* Inline Feedback Display */}
                {feedback.message && (
                    <div className={`flex items-center gap-2 p-2 rounded-lg mb-3 text-xs font-medium ${ // Reduced padding and font size
                        feedback.type === 'success'
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}>
                        {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        <p>{feedback.message}</p>
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-3"> {/* Reduced spacing */}

                    {/* Type Selector (Income/Expense) */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Transaction Type</label>
                        <div className="flex gap-2 p-1 rounded-lg border border-gray-700"> {/* Reduced gap and padding */}
                            <button
                                type="button"
                                name="type"
                                onClick={() => handleChange({ target: { name: 'type', value: 'Income' } })}
                                className={`flex-1 py-1.5 rounded-lg font-medium text-xs flex items-center justify-center gap-1 ${ // Reduced padding/font size
                                    formData.type === 'Income' ? 'bg-green-600 shadow-md text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                disabled={submitting}
                            >
                                <TrendingUp size={14} /> Income
                            </button>
                            <button
                                type="button"
                                name="type"
                                onClick={() => handleChange({ target: { name: 'type', value: 'Expense' } })}
                                className={`flex-1 py-1.5 rounded-lg font-medium text-xs flex items-center justify-center gap-1 ${ // Reduced padding/font size
                                    formData.type === 'Expense' ? 'bg-red-600 shadow-md text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                disabled={submitting}
                            >
                                <TrendingDown size={14} /> Expense
                            </button>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
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
                        <label htmlFor="when" className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                            <Calendar size={14} /><Clock size={14} /> Date and Time
                        </label>
                        <input
                            type="datetime-local"
                            id="when"
                            name="when"
                            value={formData.when}
                            onChange={handleChange}
                            className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors" // Reduced padding
                            required
                            max={getCurrentLocalDatetime()} // Max date is now
                            disabled={submitting}
                        />
                    </div>

                    {/* Category Selector */}
                    <div>
                        <label htmlFor="category" className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
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
                                <option value="">No categories</option>
                            ) : (
                                filteredCategories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Subcategory Selector (Conditional) */}
                    {currentSubcategories.length > 0 && (
                        <div>
                            <label htmlFor="sub_category_id" className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
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
                                {currentSubcategories.map(sub => (
                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Note Input */}
                    <div>
                        <label htmlFor="note" className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || feedback.type === 'success'}
                        className={`w-full py-2 px-4 rounded-lg text-white font-bold transition duration-300 flex items-center justify-center gap-2 text-sm ${ // Reduced padding and font size
                            submitting || feedback.type === 'success'
                                ? "bg-teal-700/50 cursor-not-allowed"
                                : "bg-teal-600 hover:bg-teal-500"
                            }`}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Saving...
                            </>
                        ) : feedback.type === 'success' ? (
                            <>
                                <CheckCircle size={16} /> Saved!
                            </>
                        ) : (
                            <>
                                <Plus size={16} /> Log Transaction
                            </>
                        )}
                    </button>
                </form>
            </GlassCard>
        </div>
    );
}
