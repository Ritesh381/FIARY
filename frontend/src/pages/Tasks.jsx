import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus, Check, X, Edit3, Trash2, Repeat, Calendar, Loader2, AlertTriangle, Clock, Tag, XCircle, Slash
} from 'lucide-react';
import {
    fetchTodos, toggleFormModal, openEditModal, markTodoCompleted
} from '../redux/slices/todoSlice';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskEditModal from '../components/tasks/TaskEditModal';

// --- Reusable Components ---

const GlassCard = ({ children, className = "" }) => (
    <div
        className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/10 ${className}`}
    >
        {children}
    </div>
);

const PriorityPill = ({ priority }) => {
    const p = priority ? priority.toLowerCase() : 'medium';
    const classes = useMemo(() => {
        switch (p) {
            case 'high': return 'bg-red-900/50 text-red-300 border-red-700/50';
            case 'medium': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50';
            case 'low': return 'bg-green-900/50 text-green-300 border-green-700/50';
            default: return 'bg-gray-800/50 text-gray-400 border-gray-700/50';
        }
    }, [p]);
    return (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${classes}`}>
            {p.toUpperCase()}
        </span>
    );
};

// --- Task Item Component ---
const TaskItem = ({ task, onEdit, onComplete }) => {
    const isRepeating = task.repeatSchedule !== undefined;
    const isCompleted = task.status === 'completed';
    const isPending = task.status === 'pending';
    const taskExpiresAt = task.expiresAt ? new Date(task.expiresAt) : null;
    const isExpired = taskExpiresAt && taskExpiresAt < new Date() && isPending;

    // Calculate time remaining for pending, non-repeating tasks
    const timeRemaining = useMemo(() => {
        if (isRepeating || isCompleted || !taskExpiresAt || isExpired) return null;
        
        const diff = taskExpiresAt.getTime() - new Date().getTime();
        if (diff <= 0) return null; // Handled by isExpired

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) return { text: `Due: ${taskExpiresAt.toLocaleDateString()}`, color: 'text-gray-400' };
        
        return { 
            text: `${hours}h ${minutes}m remaining`, 
            color: hours < 3 ? 'text-yellow-400' : 'text-gray-400'
        };
    }, [taskExpiresAt, isCompleted, isRepeating, isExpired]);
    
    const Icon = isRepeating ? Repeat : Calendar;
    const IconColor = isRepeating ? 'text-teal-400' : isExpired ? 'text-red-500' : 'text-indigo-400';
    
    // Main item styling
    const itemClasses = isCompleted 
        ? 'bg-green-900/30 line-through text-gray-500' 
        : isExpired 
            ? 'bg-red-900/20 text-red-300 border-red-700/50' 
            : 'hover:bg-gray-700/50 border-gray-700/50';

    // Handler for the main body click (opens edit modal)
    const handleMainClick = useCallback(() => onEdit(task), [task, onEdit]);
    
    // Determine the status text to display
    let statusText;
    if (isExpired) {
        statusText = { text: 'EXPIRED', color: 'text-red-500 font-bold' };
    } else if (isRepeating) {
        statusText = { text: task.isActive ? 'Active Template' : 'Paused Template', color: 'text-teal-400' };
    } else if (timeRemaining) {
        statusText = timeRemaining;
    } else {
        statusText = { text: task.category || 'One-Time Task', color: 'text-gray-500' };
    }


    return (
        <div 
            className={`flex items-center justify-between p-3 border-b transition-colors duration-200 group ${itemClasses}`}
        >
            <div className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer" onClick={handleMainClick}>
                <div className={`flex-shrink-0 ${IconColor}`}>
                    {isExpired ? <XCircle size={20} /> : isCompleted ? <Slash size={20} /> : <Icon size={20} />}
                </div>
                
                <div className="min-w-0">
                    <p className={`font-medium truncate ${isCompleted || isExpired ? 'text-gray-500' : 'text-white'}`}>{task.title}</p>
                    <p className='text-gray-500 font-small'>{task.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {/* Priority */}
                      <PriorityPill priority={task.priority} />
                      
                      {/* Status/Time Remaining/Category */}
                      {/* <p className={`text-xs ${statusText.color} italic truncate`}>
                        {statusText.text}
                      </p> */}
                      
                      {/* Category Pill (if not repeating) */}
                      {!isRepeating && task.category && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-800/30 text-gray-400">
                             {task.category}
                          </span>
                      )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Complete Button (Only for Pending, Non-Repeating, and Non-Expired) */}
                {isPending && !isRepeating && !isExpired && (
                    <button
                        className="p-1 rounded-full bg-green-700/50 text-green-300 hover:bg-green-600 transition-colors"
                        onClick={() => onComplete(task)}
                        aria-label="Mark task complete"
                    >
                        <Check size={18} />
                    </button>
                )}
                {/* Edit Button */}
                <button
                    className="p-1 rounded-full text-gray-500 hover:text-white transition-colors"
                    onClick={() => onEdit(task)}
                    aria-label="Edit task"
                >
                    <Edit3 size={18} />
                </button>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function TasksPage() {
    const dispatch = useDispatch();
    const { 
        todos, 
        status, 
        error, 
        isFormModalOpen, 
        isEditModalOpen 
    } = useSelector(state => state.todo);

    // Fetch data on component mount
    useEffect(() => {
        dispatch(fetchTodos());
    }, [dispatch]);
    
    // Group todos into pending/expired
    const categorizedTodos = useMemo(() => {
        const now = new Date();
        // Filter out completed and deleted items first
        const activeTodos = todos.filter(t => t.status !== 'completed' && !t.isDeleted);
        
        return activeTodos.reduce((acc, todo) => {
            // Treat repeating templates separately unless they are completed
            if (todo.repeatSchedule) {
                 acc.repeating.push(todo);
            } else if (todo.expiresAt && new Date(todo.expiresAt) < now) {
                acc.expired.push(todo);
            } else {
                acc.pending.push(todo);
            }
            return acc;
        }, { pending: [], expired: [], repeating: [] });

    }, [todos]);
    
    // --- Handlers ---
    const handleEditTask = useCallback((task) => {
        dispatch(openEditModal(task));
    }, [dispatch]);

    const handleMarkComplete = useCallback((todo) => {
        dispatch(markTodoCompleted(todo._id));
    }, [dispatch]);


    const totalActiveTasks = categorizedTodos.pending.length + categorizedTodos.repeating.length;

    return (
        <div className="p-4 md:p-8 min-h-screen max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-3">
                Tasks & Templates
            </h1>

            {/* --- Status Bar and Action --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <p className="text-sm text-gray-400">Total Active Items: <span className="font-bold text-indigo-300">{totalActiveTasks}</span></p>
                </div>
                
                <button
                    className="w-full sm:w-auto py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 font-semibold text-white transition-colors flex items-center justify-center gap-2"
                    onClick={() => dispatch(toggleFormModal(true))} 
                >
                    <Plus size={20} /> Add New Item
                </button>
            </div>
            
            {/* --- General Status Feedback --- */}
            {status === 'loading' && (
                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                    <Loader2 size={32} className="animate-spin mb-4" />
                    Loading tasks and templates...
                </div>
            )}
            {status === 'failed' && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg flex items-center gap-3 mb-6">
                    <AlertTriangle size={24} />
                    <p>{error || "Failed to load tasks. Check your API connection."}</p>
                </div>
            )}

            {/* --- Todo List: Pending, Expired, Repeating --- */}
            <GlassCard className="mb-6 p-0 overflow-hidden">
                
                {/* 1. Repeating Templates */}
                {categorizedTodos.repeating.length > 0 && (
                     <>
                        <h2 className="text-xl font-bold text-teal-400 p-4 border-b border-gray-700/50 flex items-center gap-2">
                            <Repeat size={20} /> Repeating Templates ({categorizedTodos.repeating.length})
                        </h2>
                        <div className="divide-y divide-gray-700/50 mb-4">
                            {categorizedTodos.repeating.map(todo => (
                                <TaskItem key={todo._id} task={todo} onEdit={handleEditTask} onComplete={handleMarkComplete} />
                            ))}
                        </div>
                     </>
                )}
                
                {/* 2. Pending Todos */}
                <h2 className="text-xl font-bold text-indigo-400 p-4 border-b border-gray-700/50 flex items-center gap-2">
                    <Calendar size={20} /> Pending Todos ({categorizedTodos.pending.length})
                </h2>
                <div className="divide-y divide-gray-700/50">
                    {categorizedTodos.pending.length === 0 ? (
                        <p className="p-4 text-gray-500 italic">No single-occurrence tasks pending.</p>
                    ) : (
                        categorizedTodos.pending.map(todo => (
                            <TaskItem key={todo._id} task={todo} onEdit={handleEditTask} onComplete={handleMarkComplete} />
                        ))
                    )}
                </div>

                {/* 3. Missed/Expired Todos */}
                {categorizedTodos.expired.length > 0 && (
                     <>
                        <h3 className="text-lg font-bold text-red-400 p-4 border-t border-gray-700/50 flex items-center gap-2">
                            <Clock size={18} /> Missed/Expired ({categorizedTodos.expired.length})
                        </h3>
                        <div className="divide-y divide-gray-700/50">
                            {categorizedTodos.expired.map(todo => (
                                <TaskItem key={todo._id} task={todo} onEdit={handleEditTask} onComplete={handleMarkComplete} />
                            ))}
                        </div>
                     </>
                )}
            </GlassCard>
            
            {/* Modals */}
            {isFormModalOpen && <TaskFormModal isOpen={isFormModalOpen} onClose={() => dispatch(toggleFormModal(false))} />}
            {isEditModalOpen && <TaskEditModal />}
        </div>
    );
}