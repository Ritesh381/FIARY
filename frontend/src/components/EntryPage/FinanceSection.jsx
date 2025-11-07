import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  X as XIcon,
} from "lucide-react";
import { GlassCard } from "./GlassCard.jsx";
import { getCurrentTime } from "./Entry.jsx";
import { useDispatch, useSelector } from "react-redux";
import { editFinance } from "../../redux/slices/entryEditSlice";

// --- FINANCE FORM HOOK ---
const useFinanceForm = (categories, selDate) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("Expense");
  const [category_id, setCategoryId] = useState("");
  const [sub_category_id, setSubCategoryId] = useState("");
  const [transactionTime, setTransactionTime] = useState(getCurrentTime());

  const loadData = (transaction) => {
    // handle Decimal128 case
    const rawAmount = transaction.amount;
    let parsedAmount = 0;

    if (
      typeof rawAmount === "object" &&
      rawAmount !== null &&
      "$numberDecimal" in rawAmount
    ) {
      parsedAmount = parseFloat(rawAmount.$numberDecimal);
    } else {
      parsedAmount = parseFloat(rawAmount);
    }

    setAmount(String(parsedAmount || ""));
    setNote(transaction.note || "");
    setType(transaction.type);
    setCategoryId(transaction.category_id);
    setSubCategoryId(transaction.sub_category_id || "");

    const time = transaction.when
      ? new Date(transaction.when).toISOString().substring(11, 16)
      : getCurrentTime();
    setTransactionTime(time);
  };

  const reset = () => {
    setAmount("");
    setNote("");
    setType("Expense");
    setTransactionTime(getCurrentTime());
    const defaultExpenseCat =
      categories.find((c) => c.isExpense === true)?._id || "";
    setCategoryId(defaultExpenseCat);
    setSubCategoryId("");
  };

  const filteredCategories = useMemo(() => {
    const isExpenseType = type === "Expense";
    return categories.filter((cat) => cat.isExpense === isExpenseType);
  }, [categories, type]);

  const currentSubcategories = useMemo(() => {
    const selectedCat = categories.find((c) => c._id === category_id);
    return selectedCat?.subcategories || [];
  }, [categories, category_id]);

  useEffect(() => {
    if (categories.length > 0) {
      const isCurrentCategoryValid = filteredCategories.some(
        (c) => c._id === category_id
      );
      if (!isCurrentCategoryValid) {
        const defaultCategory = filteredCategories[0]?._id || "";
        setCategoryId(defaultCategory);
        setSubCategoryId("");
      }
    }
  }, [categories, category_id, type, filteredCategories]);

  return {
    amount,
    setAmount,
    note,
    setNote,
    type,
    setType,
    category_id,
    setCategoryId,
    sub_category_id,
    setSubCategoryId,
    transactionTime,
    setTransactionTime,
    reset,
    loadData,
    filteredCategories,
    currentSubcategories,
    data: {
      amount: parseFloat(amount) || 0,
      note,
      type,
      category_id,
      sub_category_id: sub_category_id || null,
      when: `${selDate}T${transactionTime}:00.000Z`,
    },
  };
};

// --- FINANCE SECTION COMPONENT ---
const FinanceSection = ({
  finance,
  financeCategories,
  selDate,
  handleEntryChange,
}) => {
  const dispatch = useDispatch();
  const isEditing = useSelector((state) => state.entryEdit.isEditing);
  const financeForm = useFinanceForm(financeCategories, selDate);
  const [editingFinanceId, setEditingFinanceId] = useState(null);

  const getFinanceEntryDetails = useCallback(
    (financeEntryData) => {
      const selectedCategory = financeCategories.find(
        (c) => c._id === financeEntryData.category_id
      );
      const subcategories = selectedCategory?.subcategories || [];
      const selectedSubcategory = subcategories.find(
        (s) => s._id === financeEntryData.sub_category_id
      );

      return {
        ...financeEntryData,
        category_name: selectedCategory?.name,
        sub_category_name: selectedSubcategory?.name,
      };
    },
    [financeCategories]
  );

  const handleAddFinance = (e) => {
    e.preventDefault();
    if (
      !financeForm.amount ||
      !financeForm.category_id ||
      parseFloat(financeForm.amount) <= 0
    )
      return;

    const newEntryDetails = getFinanceEntryDetails(financeForm.data);
    const id = Date.now();

    const newFinanceList = [...finance, { ...newEntryDetails, id }];
    // Dispatch update to the 'finance' section, replacing the whole list
    handleEntryChange("finance", "finance", newFinanceList);
    financeForm.reset();
  };

  const handleUpdateFinance = (e) => {
    e.preventDefault();
    if (
      !editingFinanceId ||
      !financeForm.amount ||
      !financeForm.category_id ||
      parseFloat(financeForm.amount) <= 0
    )
      return;

    const updatedEntryDetails = getFinanceEntryDetails(financeForm.data);

    const updatedFinanceList = finance.map((item) =>
      item.id === editingFinanceId
        ? { ...updatedEntryDetails, id: editingFinanceId }
        : item
    );

    // Dispatch update to the 'finance' section, replacing the whole list
    handleEntryChange("finance", "finance", updatedFinanceList);

    financeForm.reset();
    setEditingFinanceId(null);
  };

  const handleSelectFinanceForEdit = useCallback(
    (transaction) => {
      setEditingFinanceId(transaction.id);
      financeForm.loadData(transaction);
    },
    [financeForm]
  );

  const handleDeleteFinance = useCallback(
    (idToDelete) => {
      const updatedFinanceList = finance.filter(
        (item) => item.id !== idToDelete
      );
      handleEntryChange("finance", "finance", updatedFinanceList);

      if (isEditing) {
        dispatch(editFinance({ _id: idToDelete, action: "delete" }));
      }
    },
    [finance, handleEntryChange, dispatch, isEditing]
  );

  // Determine the correct submit handler and button text
  const financeSubmitHandler = editingFinanceId
    ? handleUpdateFinance
    : handleAddFinance;
  const financeButtonText = editingFinanceId
    ? "Update Transaction"
    : "Add Transaction to Log";

  return (
    <GlassCard className="p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
        <DollarSign size={20} /> Transactions for Today
      </h2>
      <form onSubmit={financeSubmitHandler} className="space-y-4">
        {/* Type Selector */}
        <div className="flex gap-3 p-1 bg-gray-900/50 rounded-lg border border-gray-700">
          <button
            type="button"
            onClick={() => financeForm.setType("Income")}
            className={`flex-1 py-1 rounded-lg font-medium text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2 ${
              financeForm.type === "Income"
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            <TrendingUp size={16} /> Income
          </button>
          <button
            type="button"
            onClick={() => financeForm.setType("Expense")}
            className={`flex-1 py-1 rounded-lg font-medium text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2 ${
              financeForm.type === "Expense"
                ? "bg-red-600 text-white"
                : "text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            TrendingDown <TrendingDown size={16} /> Expense
          </button>
        </div>

        {/* Time Input Field */}
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs md:text-sm text-gray-300 flex-shrink-0">
            {new Date(selDate + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <Clock
            size={18}
            className="text-gray-400 ml-2 md:ml-4 flex-shrink-0"
          />
          <input
            type="time"
            value={financeForm.transactionTime}
            onChange={(e) => financeForm.setTransactionTime(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <select
              name="category_id"
              value={financeForm.category_id}
              onChange={(e) => financeForm.setCategoryId(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
              required
            >
              {financeForm.filteredCategories.length === 0 ? (
                <option value="">No categories</option>
              ) : (
                financeForm.filteredCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <select
              name="sub_category_id"
              value={financeForm.sub_category_id}
              onChange={(e) => financeForm.setSubCategoryId(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
              disabled={financeForm.currentSubcategories.length === 0}
            >
              <option value="">-- Subcategory --</option>
              {financeForm.currentSubcategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount and Note */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
            ₹
          </span>
          <input
            type="number"
            placeholder="Amount (required)"
            className="w-full bg-gray-900/70 rounded-lg pl-8 pr-4 py-3 border border-gray-700/50 text-sm md:text-base"
            value={financeForm.amount}
            onChange={(e) => financeForm.setAmount(e.target.value)}
            required
          />
        </div>
        <input
          type="text"
          placeholder="Note (optional)"
          className="w-full bg-gray-900/70 rounded-lg px-4 py-3 border border-gray-700/50 text-sm md:text-base"
          value={financeForm.note}
          onChange={(e) => financeForm.setNote(e.target.value)}
        />

        <button
          type="submit"
          className={`${
            editingFinanceId
              ? "bg-orange-600 hover:bg-orange-500"
              : "bg-red-600 hover:bg-red-500"
          } text-white px-4 py-2 rounded-lg text-sm font-semibold w-full`}
        >
          {financeButtonText}
        </button>

        {editingFinanceId && (
          <button
            type="button"
            onClick={() => {
              financeForm.reset();
              setEditingFinanceId(null);
            }}
            className="text-gray-400 hover:text-white mt-2 text-xs w-full text-center"
          >
            Cancel Update
          </button>
        )}

        {/* Display Transactions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700/50">
          {finance.length === 0 ? (
            <p className="text-gray-500 italic text-xs">
              No transactions added for today.
            </p>
          ) : (
            finance.map((item) => {
              const itemId = item.id || item._id;
              const isEditing = itemId === editingFinanceId;

              return (
                <div
                  key={itemId}
                  role="button"
                  onClick={() => handleSelectFinanceForEdit(item)}
                  className={`p-1.5 rounded-lg flex gap-2 items-center relative text-xs cursor-pointer transition-all duration-200 ${
                    item.type === "Income"
                      ? "bg-green-900/50 text-green-300 hover:bg-green-800/50"
                      : "bg-red-900/50 text-red-300 hover:bg-red-800/50"
                  } ${
                    isEditing
                      ? "ring-2 ring-offset-2 ring-offset-gray-800 ring-orange-500 scale-105"
                      : ""
                  }`}
                >
                  <span className="font-semibold">
                    {item.category_name || item.type}
                  </span>
                  {isEditing && item.note && (
                    <span className="text-xs italic opacity-75 hidden sm:inline">
                      ({item.note})
                    </span>
                  )}
                  <span className="text-xs font-mono">
                    ₹{parseFloat(item.amount).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFinance(itemId);
                    }}
                    className="p-0.5 ml-1 rounded-full text-gray-400 hover:text-white hover:bg-black/20 transition-colors"
                    aria-label="Delete transaction"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </form>
    </GlassCard>
  );
};

export default FinanceSection;
