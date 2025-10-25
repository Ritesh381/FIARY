import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X, Loader2, DollarSign, Tag, Calendar, NotepadText, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { toggleAddModal, createFinanceEntry, fetchFinanceEntries } from "../../redux/slices/financeSlice";

const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-white/10 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl ${className}`}>
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
        when: new Date().toISOString().split('T')[0],
        category_id: '',
        sub_category_id: '',
        note: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, message: null });

    // Pre-select first category on load
    useEffect(() => {
        if (isAddModalOpen && categories.length > 0 && !formData.category_id) {
            setFormData(prev => ({ ...prev, category_id: categories[0]._id }));
        }
    }, [isAddModalOpen, categories]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // When category changes, reset subcategory
        if (name === 'category_id') {
             setFormData({
                ...formData,
                category_id: value,
                sub_category_id: '',
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setFeedback({ type: null, message: null });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: null, message: null });

        if (!formData.amount || !formData.category_id || parseFloat(formData.amount) <= 0) {
            setFeedback({ type: 'error', message: 'Amount and Category are required.' });
            return;
        }

        setSubmitting(true);
        
        // Find names for backend API consistency
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
            await dispatch(createFinanceEntry(payload)).unwrap();
            setFeedback({ type: 'success', message: 'Entry saved successfully!' });
            
            // Fetch updated list and close modal
            dispatch(fetchFinanceEntries());
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50 transition-opacity duration-300"
            onClick={() => dispatch(toggleAddModal())}
        >
            <GlassCard 
                className="relative w-full max-w-md p-6 md:p-8 transform transition-transform scale-100 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => dispatch(toggleAddModal())}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="Close modal"
                    disabled={submitting}
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-teal-400 mb-6 text-center flex items-center justify-center gap-2">
                    <DollarSign size={24} /> Log New Transaction
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
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    
                    {/* Type Selector (Income/Expense) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Transaction Type</label>
                        <div className="flex gap-4 p-1 bg-gray-900/50 rounded-lg border border-gray-700">
                            <button 
                                type="button" 
                                onClick={() => handleChange({ target: { name: 'type', value: 'Income' } })}
                                className={`flex-1 py-2 rounded-lg font-medium transition-colors duration-200 text-sm md:text-base flex items-center justify-center gap-2 ${formData.type === 'Income' ? 'bg-green-600 shadow-md text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                disabled={submitting}
                            >
                                <TrendingUp size={16} /> Income
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleChange({ target: { name: 'type', value: 'Expense' } })}
                                className={`flex-1 py-2 rounded-lg font-medium transition-colors duration-200 text-sm md:text-base flex items-center justify-center gap-2 ${formData.type === 'Expense' ? 'bg-red-600 shadow-md text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                disabled={submitting}
                            >
                                <TrendingDown size={16} /> Expense
                            </button>
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
                            max={new Date().toISOString().split('T')[0]} // Max date is today
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
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || feedback.type === 'success'}
                        className={`w-full py-3 px-6 rounded-lg text-white font-bold transition duration-300 flex items-center justify-center gap-2 ${
                            submitting || feedback.type === 'success'
                                ? "bg-teal-700/50 cursor-not-allowed"
                                : "bg-teal-600 hover:bg-teal-500"
                        }`}
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
                                <Plus size={20} /> Add Transaction
                            </>
                        )}
                    </button>
                </form>
            </GlassCard>
        </div>
    );
}
