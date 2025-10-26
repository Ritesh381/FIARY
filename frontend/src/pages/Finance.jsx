import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Clock,
  Tag,
  NotepadText,
  Loader2,
  AlertTriangle,
  Plus,
  Edit3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchFinanceEntries,
  fetchCategoriesAndSubcategories,
  toggleAddModal,
  openEditModal,
} from "../redux/slices/financeSlice";
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
  if (amount && typeof amount === "object" && amount.$numberDecimal) {
    return parseFloat(amount.$numberDecimal).toFixed(2);
  }
  if (typeof amount === "string" || typeof amount === "number") {
    return parseFloat(amount).toFixed(2);
  }
  return "0.00";
};

// Helper function to format date to YYYY-MM-DD
const formatDateKey = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const FinanceEntryItem = ({ entry, onEdit }) => {
  const isIncome = entry.type === "Income";
  const amountColor = isIncome ? "text-green-400" : "text-red-400";

  // Display only time and Category/Subcategory in the grouped list
  const formattedTime = new Date(entry.when).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const categoryIcon = isIncome ? "💰" : "💳"; // Simple emoji icon placeholders

  return (
    <div
      className="flex items-center justify-between p-3 border-b border-gray-700/50 hover:bg-white/5 transition-colors duration-150 cursor-pointer group relative"
      onClick={() => onEdit(entry)}
    >
      {/* Left side: Icon, Category, Note */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <div className="text-xl flex-shrink-0">{categoryIcon}</div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">
            {entry.category_name || "N/A"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {entry.note || entry.sub_category_name || "No notes"}
          </p>
        </div>
      </div>

      {/* Right side: Amount, Time, Edit Button */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <div className={`text-lg font-bold ${amountColor} text-right`}>
          {isIncome ? "+₹" : "-₹"} {formatAmount(entry.amount)}
        </div>
        <div className="text-xs text-gray-500 hidden sm:block w-12 text-right">
          {formattedTime}
        </div>
        <button
          className="p-1 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-teal-400"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(entry);
          }}
          aria-label="Edit transaction"
        >
          <Edit3 size={16} />
        </button>
      </div>
    </div>
  );
};

export default function FinancePage() {
  const dispatch = useDispatch();
  const {
    entries,
    status,
    error,
    isAddModalOpen,
    isEditModalOpen,
    isCategoryModalOpen,
  } = useSelector((state) => state.finance);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState("all");

  // Fetch data on component mount (Entries and Categories)
  useEffect(() => {
    dispatch(fetchFinanceEntries());
    dispatch(fetchCategoriesAndSubcategories());
  }, [dispatch]);

  // --- Data Filtering and Grouping Logic ---
  const { monthlyTotals, groupedEntries } = useMemo(() => {
    const currentMonthEntries = entries
      .filter((entry) => {
        const entryDate = new Date(entry.when);
        const isMonthMatch =
          entryDate.getMonth() === currentDate.getMonth() &&
          entryDate.getFullYear() === currentDate.getFullYear();

        const isTypeMatch =
          filterType === "all" || entry.type.toLowerCase() === filterType;

        return isMonthMatch && isTypeMatch;
      })
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime()); // Sort newest to oldest

    const totals = currentMonthEntries.reduce(
      (acc, entry) => {
        const amount = parseFloat(formatAmount(entry.amount));
        if (entry.type === "Income") {
          acc.totalIncome += amount;
        } else {
          acc.totalExpense += amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    // Grouping by Date (YYYY-MM-DD)
    const grouped = currentMonthEntries.reduce((acc, entry) => {
      const dateKey = formatDateKey(new Date(entry.when));
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(entry);
      return acc;
    }, {});

    return { monthlyTotals: totals, groupedEntries: grouped };
  }, [entries, currentDate, filterType]);

  const netBalance = monthlyTotals.totalIncome - monthlyTotals.totalExpense;

  // --- Handlers ---
  const handleMonthChange = (offset) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  const handleEditEntry = (entry) => {
    dispatch(openEditModal(entry));
  };

  // --- UI Helpers ---
  const filterButtonClass = (type) =>
    `flex-1 px-2 py-2 text-center rounded-lg font-semibold transition-colors duration-200 text-sm ${
      filterType === type
        ? "bg-blue-600 text-white shadow-md"
        : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
    }`;

  const getDayName = (dateKey) => {
    const date = new Date(dateKey + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
    });
  };

  const getDayTotal = (dateKey) => {
    const dayEntries = groupedEntries[dateKey] || [];
    const { income, expense } = dayEntries.reduce(
      (acc, entry) => {
        const amount = parseFloat(formatAmount(entry.amount));
        if (entry.type === "Income") {
          acc.income += amount;
        } else {
          acc.expense += amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return { income, expense };
  };

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-4xl mx-auto">
      <div className="flex sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-3">
          <IndianRupee size={32} className="text-green-400" /> Finance Dashboard
        </h1>
        <GlassCard className="flex items-center gap-2 glass-select rounded-lg">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-2 rounded-md hover:bg-gray-700"
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-lg text-white mx-4">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
            aria-label="Next Month"
          >
            <ChevronRight size={20} />
          </button>
        </GlassCard>
      </div>

      {/* --- Month Selector & Category Management --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex space-x-3 w-full sm:w-auto">
          <button
            className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-colors flex items-center justify-center gap-2 text-sm"
            onClick={() => dispatch(openCategoryModal())}
          >
            <Tag size={18} /> Categories
          </button>
          <button
            className="py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 font-semibold text-white transition-colors flex items-center justify-center gap-2 text-sm"
            onClick={() => dispatch(toggleAddModal())}
          >
            <Plus size={20} /> Add Entry
          </button>
        </div>
      </div>

      {/* --- Monthly Summary Totals --- */}
      <GlassCard className="mb-6 grid grid-cols-3 divide-x divide-gray-700/50 text-center p-4">
        <div className="p-1">
          <p className="text-xs text-gray-400 font-medium">Income</p>
          <p className="text-xl sm:text-2xl font-bold text-green-400 mt-1">
            ₹ {monthlyTotals.totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="p-1">
          <p className="text-xs text-gray-400 font-medium">Expenses</p>
          <p className="text-xl sm:text-2xl font-bold text-red-400 mt-1">
            ₹ {monthlyTotals.totalExpense.toFixed(2)}
          </p>
        </div>
        <div className="p-1">
          <p className="text-xs text-gray-400 font-medium">Balance</p>
          <p
            className={`text-xl sm:text-2xl font-bold mt-1 ${
              netBalance >= 0 ? "text-teal-400" : "text-red-400"
            }`}
          >
            ₹ {netBalance.toFixed(2)}
          </p>
        </div>
      </GlassCard>

      {/* --- Type Filters --- */}
      <div className="flex space-x-3 w-full mb-6">
        <button
          onClick={() => setFilterType("all")}
          className={filterButtonClass("all")}
        >
          All
        </button>
        <button
          onClick={() => setFilterType("income")}
          className={filterButtonClass("income")}
        >
          Income
        </button>
        <button
          onClick={() => setFilterType("expense")}
          className={filterButtonClass("expense")}
        >
          Expense
        </button>
      </div>

      {/* --- Loading / Error / Data Display --- */}
      {status === "loading" && entries.length === 0 ? (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center">
          <Loader2 size={32} className="animate-spin mb-4" />
          Loading financial records...
        </div>
      ) : status === "failed" && entries.length === 0 ? (
        <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg flex items-center gap-3">
          <AlertTriangle size={24} />
          <p>
            {error || "Failed to load financial records. Please try again."}
          </p>
        </div>
      ) : Object.keys(groupedEntries).length === 0 ? (
        <GlassCard className="text-center py-10 text-gray-400">
          No {filterType !== "all" ? filterType : ""} transactions found for
          this month.
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {/* --- Grouped Transaction List --- */}
          {Object.keys(groupedEntries).map((dateKey) => {
            const dayTotal = getDayTotal(dateKey);
            return (
              <GlassCard key={dateKey} className="p-0 overflow-hidden">
                {/* Day Header */}
                <div className="flex justify-between items-center bg-gray-800/70 px-4 py-3 border-b border-gray-700/50">
                  <h3 className="text-xl font-bold text-white">
                    {getDayName(dateKey)}
                  </h3>
                  <div className="flex space-x-4 text-sm font-medium">
                    <span className="text-green-400">
                      Inc: ₹{dayTotal.income.toFixed(2)}
                    </span>
                    <span className="text-red-400">
                      Exp: ₹{dayTotal.expense.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Transaction Items */}
                <div>
                  {groupedEntries[dateKey].map((entry) => (
                    <FinanceEntryItem
                      key={entry._id}
                      entry={entry}
                      onEdit={handleEditEntry}
                    />
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Modals are rendered outside the main flow */}
      {isAddModalOpen && <FinanceFormModal />}
      {isEditModalOpen && <FinanceEditModal />}
    </div>
  );
}
