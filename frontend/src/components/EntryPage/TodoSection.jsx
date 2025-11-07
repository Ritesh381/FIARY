import React, { useState, useCallback } from 'react';
import { Check, Plus, X as XIcon, Flag } from 'lucide-react';
import { GlassCard } from "./GlassCard.jsx";

const initialTodoFormState = {
  title: "",
  priority: "medium",
  category: "Personal",
  isCustomCategory: false,
  description: ""
};

const TodoSection = ({ todo, todaysTodos, handleEntryChange, date }) => {
  const [todoForm, setTodoForm] = useState(initialTodoFormState);
  const [editingTodoId, setEditingTodoId] = useState(null);

  const BASE_CATEGORIES = ["Personal", "Work", "Health", "Finance", "Education", "Chores"];

  const handleFormChange = useCallback((field, value) => {
    setTodoForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Select a todo for editing — sets editing id AND sets isCustomCategory correctly
  const handleSelectTodoForEdit = useCallback((task) => {
    // task.category may be a built-in or a custom string
    const isCustom = !BASE_CATEGORIES.includes(task.category);
    setEditingTodoId(task.id); // make sure your addition items have `id` — consistent with your map
    setTodoForm({
      title: task.title || "",
      priority: task.priority || "medium",
      category: task.category || "Personal",
      isCustomCategory: isCustom,
      description: task.description || ""
    });
  }, [BASE_CATEGORIES]);

  // Reset the form and editing state
  const resetForm = useCallback(() => {
    setTodoForm(initialTodoFormState);
    setEditingTodoId(null);
  }, []);

  // ---------- Add ----------
  const handleAddTodoAddition = useCallback((e) => {
    e.preventDefault();
    if (todoForm.title.trim() === "") return;

    // ensure category is trimmed and not empty
    const categoryToUse = (todoForm.category || "").trim() || "Personal";

    // generate an id locally so UI can update deterministically (replace with server id on save)
    const newAddition = {
      id: `temp-${Date.now()}`, // local temporary id to avoid collisions/duplicates in UI
      date,
      title: todoForm.title.trim(),
      priority: todoForm.priority,
      category: categoryToUse,
      description: todoForm.description ? todoForm.description.trim() : ""
    };

    const newAdditions = [...(todo.addition || []), newAddition];
    handleEntryChange("todo", "addition", newAdditions);
    resetForm();
  }, [todoForm, todo.addition, handleEntryChange, resetForm, date]);

  // ---------- Update ----------
  const handleUpdateTodoAddition = useCallback((e) => {
    e.preventDefault();
    if (!editingTodoId || todoForm.title.trim() === "") return;

    const categoryToUse = (todoForm.category || "").trim() || "Personal";

    const updatedAddition = {
      id: editingTodoId,
      date,
      title: todoForm.title.trim(),
      priority: todoForm.priority,
      category: categoryToUse,
      description: todoForm.description ? todoForm.description.trim() : ""
    };

    const updatedAdditions = (todo.addition || []).map(item =>
      item.id === editingTodoId ? updatedAddition : item
    );

    handleEntryChange("todo", "addition", updatedAdditions);
    // clear editing mode
    resetForm();
  }, [editingTodoId, todoForm, todo.addition, handleEntryChange, resetForm, date]);

  // ---------- Delete ----------
  const handleDeleteTodoAddition = useCallback((idToDelete) => {
    const updatedAdditions = (todo.addition || []).filter(item => item.id !== idToDelete);
    handleEntryChange("todo", "addition", updatedAdditions);

    if (editingTodoId === idToDelete) {
      resetForm();
    }
  }, [todo.addition, editingTodoId, resetForm, handleEntryChange]);

  // submit handler and button text react to editingTodoId
  const todoSubmitHandler = editingTodoId ? handleUpdateTodoAddition : handleAddTodoAddition;
  const todoButtonText = editingTodoId ? "Update Task" : "Add Task for Tomorrow";

  // Completing today's todos (unchanged)
  const handleCompleteTodo = useCallback((task) => {
    const isCompleted = (todo.completed || []).some((t) => t._id === task._id);
    let updatedCompleted;
    if (isCompleted) updatedCompleted = (todo.completed || []).filter((t) => t._id !== task._id);
    else updatedCompleted = [...(todo.completed || []), task];

    handleEntryChange("todo", "completed", updatedCompleted);
  }, [todo.completed, handleEntryChange]);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'Low': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-700/50';
    }
  };

  return (
    <>
      {/* --- TODAY'S TODOS (Completion Tracking) --- */}
      <GlassCard className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-indigo-400 flex items-center gap-2">
          <Check size={20} /> Today's Todos
        </h2>
        <div className="space-y-2 md:space-y-3">
          {(!todaysTodos || todaysTodos.length === 0) ? (
            <p className="text-gray-500 italic text-sm">No tasks set for today. Stay productive!</p>
          ) : (
            todaysTodos.map((task) => {
              const isCompleted = (todo.completed || []).some((t) => t._id === task._id);
              return (
                <div
                  key={task._id}
                  className={`flex items-center gap-3 p-2 md:p-3 rounded-lg cursor-pointer transition-colors text-sm md:text-base ${
                    isCompleted ? "bg-green-900/30 line-through text-gray-500" : "bg-gray-700/50 hover:bg-gray-700"
                  }`}
                  onClick={() => handleCompleteTodo(task)}
                >
                  <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    isCompleted ? "border-green-500 bg-green-500" : "border-gray-500"
                  }`}>
                    {isCompleted && <Check size={12} className="text-white" />}
                  </div>
                  <span className="flex-1 truncate">{task.title}</span>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>

      {/* --- TODOS FOR TOMORROW (Addition/Editing Form) --- */}
      <GlassCard className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-indigo-400 flex items-center gap-2">
          <Plus size={20} /> Tasks for Tomorrow Log {editingTodoId && <span className="text-sm text-orange-400">(Editing)</span>}
        </h2>

        <form onSubmit={todoSubmitHandler} className="space-y-3">
          {/* 1. Title */}
          <input
            type="text"
            placeholder="Task Title (required)"
            className="w-full bg-gray-900/70 rounded-lg pl-4 pr-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm md:text-base"
            value={todoForm.title}
            onChange={(e) => handleFormChange("title", e.target.value)}
            required
          />

          {/* 2. Priority + Category */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <select
              value={todoForm.priority}
              onChange={(e) => handleFormChange("priority", e.target.value)}
              className="p-2 rounded-lg bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600"
            >
              <option value="High">Priority: High</option>
              <option value="medium">Priority: medium</option>
              <option value="Low">Priority: Low</option>
            </select>

            {/* Category: either select or input depending on isCustomCategory */}
            {todoForm.isCustomCategory ? (
              <input
                type="text"
                value={todoForm.category}
                onChange={(e) => handleFormChange("category", e.target.value)}
                placeholder="Enter new category"
                className="p-2 rounded-lg bg-gray-900/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600"
              />
            ) : (
              <select
                value={BASE_CATEGORIES.includes(todoForm.category) ? todoForm.category : BASE_CATEGORIES[0]}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__OTHER__") {
                    // switch to custom mode; do NOT set category to empty (preserve previous custom if any)
                    setTodoForm(prev => ({ ...prev, isCustomCategory: true, category: "" }));
                  } else {
                    setTodoForm(prev => ({ ...prev, isCustomCategory: false, category: v }));
                  }
                }}
                className="p-2 rounded-lg bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600"
              >
                {BASE_CATEGORIES.map(c => <option key={c} value={c}>{`Category: ${c}`}</option>)}
                <option value="__OTHER__">Other (Custom)</option>
              </select>
            )}
          </div>

          {/* 3. Description */}
          <textarea
            rows="2"
            placeholder="Description (optional)"
            className="w-full bg-gray-900/70 rounded-lg resize-none px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm md:text-base"
            value={todoForm.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
          />

          {/* 4. Submit */}
          <button
            type="submit"
            className={`font-semibold py-2 rounded-lg w-full transition-colors ${editingTodoId ? 'bg-orange-600 hover:bg-orange-500' : 'bg-teal-600 hover:bg-teal-500'} text-white`}
          >
            {todoButtonText}
          </button>

          {editingTodoId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-400 hover:text-white mt-1 text-xs w-full text-center"
            >
              Cancel Update
            </button>
          )}
        </form>

        {/* Display Added/Temporary Todos */}
        <div className="space-y-2 pt-4 border-t border-gray-700/50 mt-4">
          {(!todo.addition || todo.addition.length === 0) ? (
            <p className="text-gray-500 italic text-sm">No tasks added for tomorrow.</p>
          ) : (
            todo.addition.map((item) => {
              const isEditing = item.id === editingTodoId;
              const priorityStyle = getPriorityStyle(item.priority);

              return (
                <div
                  key={item.id}
                  role="button"
                  onClick={() => handleSelectTodoForEdit(item)}
                  className={`p-3 rounded-lg flex justify-between items-center text-sm cursor-pointer transition-all duration-200 border ${isEditing ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-orange-500 scale-[1.02] bg-gray-700' : 'bg-gray-700/50 hover:bg-gray-700/80 border-gray-600'}`}
                >
                  <div className="flex flex-col flex-1 truncate pr-2">
                    <span className={`font-medium ${isEditing ? 'text-white' : 'text-gray-200'} truncate`}>{item.title}</span>
                    <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full ${priorityStyle}`}>
                        <Flag size={10} className="inline mr-1" />{item.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-900/50">{item.category}</span>
                      {item.description && (<span className="text-xs italic text-gray-400 hidden sm:inline">{item.description}</span>)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTodoAddition(item.id);
                    }}
                    className="p-1 ml-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-black/20 transition-colors flex-shrink-0"
                    aria-label="Delete task"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>
    </>
  );
};

export default TodoSection;
