import React, { useState } from "react";
import { Plus, Edit3, Trash2, Check, X, AlertTriangle, ChevronDown } from "lucide-react";
import apiFinanceConfig from "../../api/FinanceConfigCalls";

const GlassCard = ({ children, className = "" }) => (
    <div
        className={`bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 shadow-xl border border-white/10 ${className}`}
    >
        {children}
    </div>
);

export default function FinanceConfig({ categories, onCategoriesUpdate }) {
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryIsExpense, setNewCategoryIsExpense] = useState(true); // default Expense
    const [newSubCategoryName, setNewSubCategoryName] = useState("");
    const [selectedCategoryForSub, setSelectedCategoryForSub] = useState(null);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddSubCategory, setShowAddSubCategory] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [editCategoryName, setEditCategoryName] = useState("");
    const [editSubCategoryName, setEditSubCategoryName] = useState("");

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
    };

    // Category Operations
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            showFeedback("error", "Category name is required");
            return;
        }

        setLoading(true);
        try {
            await apiFinanceConfig.createCategory({ name: newCategoryName, isExpense: newCategoryIsExpense });
            showFeedback("success", "Category added successfully");
            setNewCategoryName("");
            setShowAddCategory(false);
            onCategoriesUpdate();
        } catch (error) {
            showFeedback("error", error.response?.data?.message || "Failed to add category");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCategory = async (categoryId, newName) => {
        if (!newName.trim()) {
            showFeedback("error", "Category name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await apiFinanceConfig.updateCategory(categoryId, { name: newName });
            showFeedback("success", "Category updated successfully");
            setEditingCategory(null);
            onCategoriesUpdate();
        } catch (error) {
            showFeedback("error", error.response?.data?.message || "Failed to update category");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category? This will also delete all its subcategories.")) {
            return;
        }

        setLoading(true);
        try {
            await apiFinanceConfig.deleteCategory(categoryId);
            showFeedback("success", "Category deleted successfully");
            onCategoriesUpdate();
        } catch (error) {
            showFeedback("error", error.response?.data?.message || "Failed to delete category");
        } finally {
            setLoading(false);
        }
    };

    // SubCategory Operations
    const handleAddSubCategory = async (categoryId) => {
        if (!newSubCategoryName.trim()) {
            showFeedback("error", "Subcategory name is required");
            return;
        }

        setLoading(true);
        try {
            await apiFinanceConfig.createSubCategory({
                name: newSubCategoryName,
                categoryId: categoryId,
            });
            showFeedback("success", "Subcategory added successfully");
            setNewSubCategoryName("");
            setShowAddSubCategory(false);
            setSelectedCategoryForSub(null);
            onCategoriesUpdate();
        } catch (error) {
            showFeedback("error", error.response?.data?.message || "Failed to add subcategory");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubCategory = async (subCategoryId, newName) => {
        if (!newName.trim()) {
            showFeedback("error", "Subcategory name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await apiFinanceConfig.updateSubCategory(subCategoryId, { name: newName });
            showFeedback("success", "Subcategory updated successfully");
            setEditingSubCategory(null);
            onCategoriesUpdate();
        } catch (error) {
            showFeedback("error", error.response?.data?.message || "Failed to update subcategory");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubCategory = async (subCategoryId) => {
        if (!window.confirm("Are you sure you want to delete this subcategory?")) {
            return;
        }

        setLoading(true);
        try {
            await apiFinanceConfig.deleteSubCategory(subCategoryId);
            showFeedback("success", "Subcategory deleted successfully");
            onCategoriesUpdate();
        } catch (error) {
            showFeedback("error", error.response?.data?.message || "Failed to delete subcategory");
        } finally {
            setLoading(false);
        }
    };

    // Toggle category expansion
    const toggleCategory = (categoryId) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const renderCategoryCard = (category) => (
        <GlassCard key={category._id} className="mb-3">
            {/* Category Header - Clickable to expand/collapse */}
            <div className="flex items-center justify-between">
                {editingCategory === category._id ? (
                    <div className="flex-1 flex gap-2 items-center">
                        <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleUpdateCategory(category._id, editCategoryName);
                                }
                            }}
                            className="flex-1 bg-gray-900/70 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm md:text-base"
                            autoFocus
                        />
                        <button
                            onClick={() => handleUpdateCategory(category._id, editCategoryName)}
                            className="p-1.5 md:p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
                        >
                            <Check size={14} className="md:w-[16px] md:h-[16px]" />
                        </button>
                        <button
                            onClick={() => {
                                setEditingCategory(null);
                                setEditCategoryName("");
                            }}
                            className="p-1.5 md:p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                        >
                            <X size={14} className="md:w-[16px] md:h-[16px]" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div
                            className="flex items-center gap-2 md:gap-3 flex-1 cursor-pointer hover:bg-white/5 -m-2 p-2 rounded-lg transition-colors"
                            onClick={() => toggleCategory(category._id)}
                        >
                            <button className="text-gray-400 hover:text-white transition-transform">
                                <ChevronDown
                                    size={16}
                                    className={`md:w-[20px] md:h-[20px] transition-transform duration-200 ${
                                        expandedCategories[category._id] ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                            <h3 className="text-lg md:text-xl font-semibold text-white">
                                {category.name}
                            </h3>
                            <span className="text-xs md:text-sm text-gray-400 ml-1 md:ml-2">
                                ({category.subcategories?.length || 0} subs)
                            </span>
                        </div>
                        <div className="flex gap-1 md:gap-2">
                            <button
                                onClick={() => {
                                    setEditingCategory(category._id);
                                    setEditCategoryName(category.name);
                                }}
                                className="p-1.5 md:p-2 text-blue-400 hover:text-blue-300 transition-colors"
                                title="Edit category"
                            >
                                <Edit3 size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                            <button
                                onClick={() => handleDeleteCategory(category._id)}
                                className="p-1.5 md:p-2 text-red-400 hover:text-red-300 transition-colors"
                                title="Delete category"
                                disabled={loading}
                            >
                                <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Subcategories - Only show when expanded */}
            {expandedCategories[category._id] && (
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-700 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs md:text-sm font-semibold text-gray-400 uppercase">
                            Subcategories
                        </h4>
                        <button
                            onClick={() => {
                                setSelectedCategoryForSub(category._id);
                                setShowAddSubCategory(true);
                            }}
                            className="text-xs px-2 md:px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1"
                        >
                            <Plus size={12} className="md:w-[14px] md:h-[14px]" />
                            <span className="hidden sm:inline">Add Sub</span>
                            <span className="sm:hidden">+</span>
                        </button>
                    </div>

                    {/* Add Subcategory Form */}
                    {showAddSubCategory && selectedCategoryForSub === category._id && (
                        <div className="flex gap-2 mb-2 bg-gray-800/50 p-2 rounded-lg">
                            <input
                                type="text"
                                value={newSubCategoryName}
                                onChange={(e) => setNewSubCategoryName(e.target.value)}
                                placeholder="Subcategory name"
                                className="flex-1 bg-gray-900/70 border border-gray-600 rounded px-2 md:px-3 py-1 text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                                onKeyPress={(e) =>
                                    e.key === "Enter" && handleAddSubCategory(category._id)
                                }
                            />
                            <button
                                onClick={() => handleAddSubCategory(category._id)}
                                className="px-2 md:px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs md:text-sm"
                                disabled={loading}
                            >
                                <Check size={12} className="md:w-[14px] md:h-[14px]" />
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddSubCategory(false);
                                    setSelectedCategoryForSub(null);
                                    setNewSubCategoryName("");
                                }}
                                className="px-2 md:px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs md:text-sm"
                            >
                                <X size={12} className="md:w-[14px] md:h-[14px]" />
                            </button>
                        </div>
                    )}

                    {/* Subcategories List */}
                    {category.subcategories && category.subcategories.length > 0 ? (
                        <div className="space-y-1">
                            {category.subcategories.map((sub) => (
                                <div
                                    key={sub._id}
                                    className="flex items-center justify-between bg-gray-800/30 rounded-lg px-2 md:px-3 py-1.5 md:py-2"
                                >
                                    {editingSubCategory === sub._id ? (
                                        <div className="flex-1 flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={editSubCategoryName}
                                                onChange={(e) => setEditSubCategoryName(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleUpdateSubCategory(sub._id, editSubCategoryName);
                                                    }
                                                }}
                                                className="flex-1 bg-gray-900/70 border border-gray-600 rounded px-2 py-1 text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleUpdateSubCategory(sub._id, editSubCategoryName)}
                                                className="p-1 bg-green-600 hover:bg-green-500 text-white rounded"
                                            >
                                                <Check size={12} className="md:w-[14px] md:h-[14px]" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingSubCategory(null);
                                                    setEditSubCategoryName("");
                                                }}
                                                className="p-1 bg-gray-600 hover:bg-gray-500 text-white rounded"
                                            >
                                                <X size={12} className="md:w-[14px] md:h-[14px]" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-gray-300 text-xs md:text-sm">
                                                {sub.name}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingSubCategory(sub._id);
                                                        setEditSubCategoryName(sub.name);
                                                    }}
                                                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    <Edit3 size={12} className="md:w-[14px] md:h-[14px]" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSubCategory(sub._id)}
                                                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                                    disabled={loading}
                                                >
                                                    <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-xs md:text-sm">No subcategories yet</p>
                    )}
                </div>
            )}
        </GlassCard>
    );

    return (
        <div className="space-y-4 md:space-y-6 px-2 md:px-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
                ⚙️ Finance Configuration
            </h1>

            {/* Feedback Message */}
            {feedback.message && (
                <div
                    className={`p-3 md:p-4 rounded-lg flex items-center gap-3 ${feedback.type === "error"
                            ? "bg-red-900/50 border border-red-500 text-red-300"
                            : "bg-green-900/50 border border-green-500 text-green-300"
                        }`}
                >
                    {feedback.type === "error" ? (
                        <AlertTriangle size={18} className="md:w-[20px] md:h-[20px]" />
                    ) : (
                        <Check size={18} className="md:w-[20px] md:h-[20px]" />
                    )}
                    <p className="text-sm md:text-base">{feedback.message}</p>
                </div>
            )}

            {/* Add Category Button */}
            <div className="flex justify-center md:justify-end">
                <button
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    className="px-3 md:px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm md:text-base"
                    disabled={loading}
                >
                    <Plus size={18} className="md:w-[20px] md:h-[20px]" />
                    <span className="hidden sm:inline">Add New Category</span>
                    <span className="sm:hidden">Add Category</span>
                </button>
            </div>

            {/* Add Category Form */}
            {showAddCategory && (
                <GlassCard>
                    <h3 className="text-lg font-semibold text-white mb-3">
                        Add New Category
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name"
                            className="flex-1 bg-gray-900/70 border border-gray-600 rounded-lg px-3 md:px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm md:text-base"
                            onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                        />
                        {/* Expense/Income selector */}
                        <select
                            value={newCategoryIsExpense ? "expense" : "income"}
                            onChange={(e) => setNewCategoryIsExpense(e.target.value === "expense")}
                            className="bg-gray-900/70 border border-gray-600 rounded-lg px-2 md:px-3 py-2 text-white text-sm md:text-base"
                        >
                            <option value="expense">💸 Expense</option>
                            <option value="income">💰 Income</option>
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddCategory}
                                className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center gap-2 text-sm md:text-base"
                                disabled={loading}
                            >
                                <Check size={16} className="md:w-[18px] md:h-[18px]" />
                                Add
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddCategory(false);
                                    setNewCategoryName("");
                                }}
                                className="px-3 md:px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg flex items-center gap-2 text-sm md:text-base"
                            >
                                <X size={16} className="md:w-[18px] md:h-[18px]" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Categories List */}
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Expense Categories */}
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold text-white mb-4">💸 Expense Categories</h2>
                        <div className="space-y-3">
                            {categories.filter(c => c.isExpense).length === 0 ? (
                                <GlassCard>
                                    <p className="text-gray-400 italic text-center text-sm">No expense categories yet.</p>
                                </GlassCard>
                            ) : (
                                categories.filter(c => c.isExpense).map(renderCategoryCard)
                            )}
                        </div>
                    </div>

                    {/* Income Categories */}
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold text-white mb-4">💰 Income Categories</h2>
                        <div className="space-y-3">
                            {categories.filter(c => !c.isExpense).length === 0 ? (
                                <GlassCard>
                                    <p className="text-gray-400 italic text-center text-sm">No income categories yet.</p>
                                </GlassCard>
                            ) : (
                                categories.filter(c => !c.isExpense).map(renderCategoryCard)
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}