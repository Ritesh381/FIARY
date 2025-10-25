import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DollarSign, TrendingUp, TrendingDown, Clock, Tag, NotepadText, Loader2, AlertTriangle, Plus, Edit3 } from 'lucide-react';
import { fetchFinanceEntries, fetchCategoriesAndSubcategories, toggleAddModal, openEditModal } from "../redux/slices/financeSlice";
import FinanceFormModal from "../components/finance/FinanceFormModal";
import FinanceEditModal from "../components/finance/FinanceEditModal";

const GlassCard = ({ children, className = "" }) => (
    <div
        className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-2xl border border-white/10 ${className}`}
    >
        {children}
    </div>
);

// Helper to format Decimal128 amount safely
const formatAmount = (amount) => {
    // Safely handle Decimal128 object or string/number
    if (amount && typeof amount === 'object' && amount.$numberDecimal) {
        return parseFloat(amount.$numberDecimal).toFixed(2);
    }
    if (typeof amount === 'string' || typeof amount === 'number') {
        return parseFloat(amount).toFixed(2);
    }
    return '0.00';
};

const FinanceEntryCard = ({ entry, onEdit }) => {
    const isIncome = entry.type === 'Income';
    const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
    const Icon = isIncome ? TrendingUp : TrendingDown;

    const formattedDate = new Date(entry.when).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <GlassCard 
            className="p-4 flex flex-col space-y-3 relative hover:scale-[1.02] transition-transform duration-200 cursor-pointer group"
            onClick={() => onEdit(entry)}
        >
            {/* Edit Button */}
            <button 
                className="absolute top-3 right-3 p-2 rounded-full bg-gray-800/70 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white z-10"
                onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
                aria-label="Edit transaction"
            >
                <Edit3 size={18} />
            </button>

            {/* Header: Type and Amount */}
            <div className="flex justify-between items-center pb-2 border-b border-gray-700/50">
                <div className="flex items-center space-x-2">
                    <Icon size={20} className={amountColor} />
                    <span className={`font-bold text-lg ${amountColor}`}>{entry.type}</span>
                </div>
                <div className={`text-2xl font-extrabold ${amountColor}`}>
                    ₹ {formatAmount(entry.amount)}
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-300">
                {/* Category */}
                <div className="flex items-center space-x-2">
                    <Tag size={16} className="text-blue-400" />
                    <span className="font-semibold truncate">{entry.category_name || 'N/A'}</span>
                </div>
                {/* Date */}
                <div className="flex items-center space-x-2 justify-end text-right">
                    <Clock size={16} className="text-gray-500" />
                    <span>{formattedDate}</span>
                </div>
                {/* SubCategory */}
                <div className="flex items-center space-x-2 col-span-2">
                    <Tag size={16} className="text-purple-400" />
                    <span className="text-gray-400 truncate">{entry.sub_category_name || '-'}</span>
                </div>
            </div>

            {/* Note */}
            {entry.note && (
                <div className="pt-2 border-t border-gray-700/50">
                    <div className="flex items-center space-x-2 text-xs italic text-gray-400">
                        <NotepadText size={16} />
                        <span className="truncate">{entry.note}</span>
                    </div>
                </div>
            )}
        </GlassCard>
    );
};

export default function FinancePage() {
    const dispatch = useDispatch();
    const { entries, status, error, isAddModalOpen, isEditModalOpen } = useSelector(state => state.finance);
    const [filterType, setFilterType] = useState('all');

    // Fetch data on component mount
    useEffect(() => {
        dispatch(fetchFinanceEntries());
        dispatch(fetchCategoriesAndSubcategories());
    }, [dispatch]);
    
    // --- Data Processing for Totals and Filtering ---
    const { totalIncome, totalExpense } = entries.reduce((acc, entry) => {
        const amount = parseFloat(formatAmount(entry.amount));
        if (entry.type === 'Income') {
            acc.totalIncome += amount;
        } else {
            acc.totalExpense += amount;
        }
        return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    const netBalance = totalIncome - totalExpense;

    const filteredEntries = entries.filter(entry => {
        if (filterType === 'all') return true;
        return entry.type.toLowerCase() === filterType;
    });

    const filterButtonClass = (type) =>
        `px-4 py-2 rounded-full font-semibold transition-colors duration-200 text-sm ${
            filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
        }`;

    const handleEditEntry = (entry) => {
        dispatch(openEditModal(entry));
    };

    return (
        <div className="p-4 md:p-8 min-h-screen max-w-6xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-3">
                <DollarSign size={32} className="text-green-400" /> Financial Dashboard
            </h1>

            {/* --- Summary / Totals --- */}
            <GlassCard className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3">
                    <p className="text-gray-400 font-medium">Total Income</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">₹ {totalIncome.toFixed(2)}</p>
                </div>
                <div className="p-3">
                    <p className="text-gray-400 font-medium">Total Expense</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">₹ {totalExpense.toFixed(2)}</p>
                </div>
                <div className="p-3">
                    <p className="text-gray-400 font-medium">Net Balance</p>
                    <p className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                        ₹ {netBalance.toFixed(2)}
                    </p>
                </div>
            </GlassCard>

            {/* --- Filters and Actions --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex space-x-3 w-full sm:w-auto">
                    <button onClick={() => setFilterType('all')} className={filterButtonClass('all')}>
                        All
                    </button>
                    <button onClick={() => setFilterType('income')} className={filterButtonClass('income')}>
                        Income
                    </button>
                    <button onClick={() => setFilterType('expense')} className={filterButtonClass('expense')}>
                        Expense
                    </button>
                </div>
                
                <button
                    className="w-full sm:w-auto py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 font-semibold text-white transition-colors flex items-center justify-center gap-2"
                    onClick={() => dispatch(toggleAddModal())} 
                >
                    <Plus size={20} /> Add New Entry
                </button>
            </div>

            {/* --- Loading / Error / Data Display --- */}
            {status === 'loading' && entries.length === 0 ? (
                <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                    <Loader2 size={32} className="animate-spin mb-4" />
                    Loading financial records...
                </div>
            ) : status === 'failed' && entries.length === 0 ? (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg flex items-center gap-3">
                    <AlertTriangle size={24} />
                    <p>{error || "Failed to load financial records. Please try again."}</p>
                </div>
            ) : filteredEntries.length === 0 ? (
                <GlassCard className="text-center py-10 text-gray-400">
                    No {filterType !== 'all' ? filterType : ''} entries found. Click "Add New Entry" to start logging!
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEntries.map((entry) => (
                        <FinanceEntryCard key={entry._id} entry={entry} onEdit={handleEditEntry} />
                    ))}
                </div>
            )}
            
            {/* Modals are rendered outside the main flow */}
            {isAddModalOpen && <FinanceFormModal />}
            {isEditModalOpen && <FinanceEditModal />}
        </div>
    );
}
