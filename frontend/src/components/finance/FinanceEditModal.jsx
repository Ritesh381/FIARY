import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Loader2, DollarSign, Tag, Calendar, NotepadText, AlertTriangle, CheckCircle, Edit3, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { closeEditModal, updateFinanceEntry, deleteFinanceEntry, fetchFinanceEntries } from "../../redux/slices/financeSlice";

const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-white/10 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl ${className}`}>
        {children}
    </div>
);

// Helper to format Decimal128 amount safely for display
const formatAmount = (amount) => {
    if (amount && typeof amount === 'object' && amount.$numberDecimal) {
        return parseFloat(amount.$numberDecimal).toFixed(2);
    }
    if (typeof amount === 'string' || typeof amount === 'number') {
        return parseFloat(amount).toFixed(2);
    }
    return '';
};

// Helper to find subcategories for a given category ID
const getSubcategories = (categories, categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.subcategories || [];
};

export default function FinanceEditModal() {
    const dispatch = useDispatch();
    const { isEditModalOpen, selectedEntry, categories } = useSelector(state => state.finance);
    const user = useSelector(state => state.user.user);
    
    // Form state
    const [formData, setFormData] = useState({
        type: 'Expense',
        amount: '',
        when: new Date().toISOString().split('T')[0],
        category_id: '',
        sub_category_id: '',
        note: '',
        _id: null,
    });

    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, message: null });
    
    // Deletion states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
    const [deleting, setDeleting] = useState(false);

    // Effect to populate form when an entry is selected
    useEffect(() => {
        if (selectedEntry) {
            setFormData({
                type: selectedEntry.type,
                amount: formatAmount(selectedEntry.amount),
                when: selectedEntry.when.split('T')[0], // Use date part only
                category_id: selectedEntry.category_id?._id || selectedEntry.category_id || '',
                sub_category_id: selectedEntry.sub_category_id?._id || selectedEntry.sub_category_id || '',
                note: selectedEntry.note || '',
                _id: selectedEntry._id,
            });
            setFeedback({ type: null, message: null });
        }
    }, [selectedEntry]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category_id') {
             setFormData({
                ...formData,
                category_id: value,
                sub_category_id: '', // Reset subcategory on category change
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setFeedback({ type: null, message: null });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: null, message: null });
        if (!formData.amount || !formData.category_id || parseFloat(formData.amount) <= 0) {
            setFeedback({ type: 'error', message: 'Amount and Category are required.' });
            return;
        }

        setSubmitting(true);

        const selectedCategory = categories.find(c => c._id === formData.category_id);
        const selectedSubcategory = getSubcategories(categories, formData.category_id).find(s => s._id === formData.sub_category_id);

        const payload = {
            ...formData,
            amount: parseFloat(formData.amount),
            created_by: user._id,
            category_name: selectedCategory?.name,
            sub_category_name: selectedSubcategory?.name,
        };
        
        try {
            await dispatch(updateFinanceEntry({ id: formData._id, updatedData: payload })).unwrap();
            setFeedback({ type: 'success', message: 'Entry updated successfully! Closing...' });
            
            // Fetch updated list and close modal
            dispatch(fetchFinanceEntries());
            setTimeout(() => dispatch(closeEditModal()), 1000);

        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Failed to update entry.' });
        } finally {
            setSubmitting(false);
        }
    };
    
    // --- Deletion Handlers ---
    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
        setDeleteConfirmInput('');
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirmInput !== confirmationSignature || deleting) {
            setFeedback({ type: 'error', message: 'Confirmation phrase does not match.' });
            return;
        }
        
        setDeleting(true);
        setFeedback({ type: null, message: null });

        try {
            await dispatch(deleteFinanceEntry(formData._id)).unwrap();
            setFeedback({ type: 'success', message: 'Entry deleted successfully! Closing...' });

            // Close after a short success display
            setTimeout(() => dispatch(closeEditModal()), 1000);

        } catch (error) {
            setFeedback({ type: 'error', message: 'Failed to delete entry.' });
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    // Deletion confirmation logic
    const confirmationSignature = `DELETE ${formData.type.toUpperCase()} ENTRY: ₹${formatAmount(formData.amount)} on ${formData.when}`;
    
    if (!isEditModalOpen || !selectedEntry) return null;

    const currentSubcategories = getSubcategories(categories, formData.category_id);

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50 transition-opacity duration-300"
            onClick={() => dispatch(closeEditModal())}
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
                            This action cannot be undone. You are about to permanently delete this entry.
                        </p>
                        <p className="text-gray-400 text-xs mb-3">
                            To confirm, please type the following exactly:
                            <br />
                            <code className="text-amber-400 font-mono bg-gray-700/50 p-1 rounded block mt-1 select-all text-sm break-all">
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
                                onClick={() => {if (!deleting) setShowDeleteConfirm(false)}}
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
            <GlassCard 
                className="relative w-full max-w-md p-6 md:p-8 transform transition-transform scale-100 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => dispatch(closeEditModal())}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="Close modal"
                    disabled={submitting}
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-teal-400 mb-6 text-center flex items-center justify-center gap-2">
                    <Edit3 size={24} /> Edit Transaction
                </h2>

                {/* Inline Feedback Display */}
                {feedback.message && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm font-medium ${
                        feedback.type === 'success'
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                    }`}>
                        {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        <p>{feedback.message}</p>
                    </div>
                )}
                
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    
                    {/* Type Selector (Read-only/Disabled for edit for simplicity, though the API supports it) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Transaction Type</label>
                        <div className="flex gap-4 p-1 bg-gray-900/50 rounded-lg border border-gray-700 opacity-70">
                            <div className={`flex-1 py-2 rounded-lg font-medium text-sm md:text-base flex items-center justify-center gap-2 ${formData.type === 'Income' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                <TrendingUp size={16} /> Income
                            </div>
                            <div className={`flex-1 py-2 rounded-lg font-medium text-sm md:text-base flex items-center justify-center gap-2 ${formData.type === 'Expense' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                <TrendingDown size={16} /> Expense
                            </div>
                        </div>
                    </div>
                    
                    {/* Amount Input */}
                    <div className="relative">
                        <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="Amount (required)"
                            min="0.01"
                            step="0.01"
                            className="w-full p-3 pl-10 rounded-lg bg-gray-900/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
                            required
                            disabled={submitting}
                        />
                    </div>
                    
                    {/* Date Input */}
                    <div>
                        <label htmlFor="when" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Calendar size={16} /> Date</label>
                        <input
                            type="date"
                            id="when"
                            name="when"
                            value={formData.when}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
                            required
                            max={new Date().toISOString().split('T')[0]} 
                            disabled={submitting}
                        />
                    </div>

                    {/* Category Selector */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Tag size={16} /> Category (required)</label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
                            required
                            disabled={submitting || categories.length === 0}
                        >
                            {categories.length === 0 ? (
                                <option value="">Loading categories...</option>
                            ) : (
                                categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Subcategory Selector (Conditional) */}
                    {currentSubcategories.length > 0 && (
                        <div>
                            <label htmlFor="sub_category_id" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Tag size={16} /> Subcategory (optional)</label>
                            <select
                                id="sub_category_id"
                                name="sub_category_id"
                                value={formData.sub_category_id}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
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
                        <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><NotepadText size={16} /> Note (optional)</label>
                        <textarea
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Short description of the transaction"
                            className="w-full p-3 rounded-lg bg-gray-900/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors resize-none"
                            disabled={submitting}
                        />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="py-3 px-6 rounded-lg text-white font-bold transition duration-300 bg-red-600 hover:bg-red-700 flex items-center gap-2"
                            disabled={submitting}
                        >
                            <Trash2 size={20}/> Delete
                        </button>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => dispatch(closeEditModal())}
                                className="py-3 px-6 rounded-lg text-white font-bold transition duration-300 bg-gray-600/50 hover:bg-gray-500/50"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`py-3 px-6 rounded-lg text-white font-bold transition duration-300 flex items-center justify-center gap-2 ${
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
                                        <CheckCircle size={20} /> Saved!
                                    </>
                                ) : (
                                    <>
                                        <Edit3 size={20} /> Save Changes
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
