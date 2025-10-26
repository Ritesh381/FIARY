import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus, Check, X, Edit3, Trash2, Repeat, Calendar, Loader2, AlertTriangle, Clock, Tag
} from 'lucide-react';
import {
    fetchTodos, fetchRepeatingTasks, toggleFormModal, openEditModal, markTodoCompleted
} from '../redux/slices/todoSlice';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskEditModal from '../components/tasks/TaskEditModal';

const GlassCard = ({ children, className = "" }) => (
    <div
        className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/10 ${className}`}
    >
        {children}
    </div>
);

// --- Task Item Component ---
const TaskItem = ({ task, onEdit, onComplete }) => {
    const isRepeating = task.repeatSchedule !== undefined;
    const isCompleted = task.status === 'completed';
    const isPending = task.status === 'pending';

    // Calculate time remaining only for pending one-time Todos
    const timeRemaining = useMemo(() => {
        if (isRepeating || isCompleted || !task.expiresAt) return null;
        
        const now = new Date();
        const expires = new Date(task.expiresAt);
        const diff = expires.getTime() - now.getTime();
        
        if (diff <= 0) return { text: 'EXPIRED', color: 'text-red-500' };

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) return null; // Don't show countdown if > 24 hours
        
        return { 
            text: `${hours}h ${minutes}m remaining`, 
            color: hours < 3 ? 'text-yellow-400' : 'text-gray-400'
        };
    }, [task.expiresAt, isCompleted, isRepeating]);
    
    const Icon = isRepeating ? Repeat : Calendar;

    return (
        <div 
            className={`flex items-center justify-between p-3 rounded-lg border-b border-gray-700/50 transition-colors duration-200 cursor-pointer group 
                ${isCompleted ? 'bg-green-900/30 line-through text-gray-500' : 'hover:bg-gray-700/50'}`}
        >
            <div className="flex items-center space-x-3 flex-1 min-w-0" onClick={() => onEdit(task)}>
                <div className={`flex-shrink-0 ${isRepeating ? 'text-teal-400' : 'text-indigo-400'}`}>
                    <Icon size={20} />
                </div>
                <div className="min-w-0">
                    <p className={`font-medium truncate ${isCompleted ? 'text-gray-500' : 'text-white'}`}>{task.title}</p>
                    <p className={`text-xs ${timeRemaining?.color || 'text-gray-500'} italic`}>
                        {isRepeating 
                            ? (task.isActive ? 'Active Template' : 'Paused Template')
                            : timeRemaining ? timeRemaining.text : task.category || 'One-Time Task'}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Complete Button (Only for Pending Todos) */}
                {isPending && !isRepeating && (
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
        repeatingTasks, 
        status, 
        error, 
        isFormModalOpen, 
        isEditModalOpen 
    } = useSelector(state => state.todo);

    // Fetch data on component mount
    useEffect(() => {
        dispatch(fetchTodos());
        dispatch(fetchRepeatingTasks());
    }, [dispatch]);
    
    // Group todos into pending/completed/expired
    const categorizedTodos = useMemo(() => {
        const now = new Date();
        const activeTodos = todos.filter(t => t.status !== 'completed' && !t.isDeleted);
        
        return activeTodos.reduce((acc, todo) => {
            const expires = new Date(todo.expiresAt);
            if (expires < now) {
                acc.expired.push(todo);
            } else {
                acc.pending.push(todo);
            }
            return acc;
        }, { pending: [], expired: [] });

    }, [todos]);
    
    // --- Handlers ---
    const handleEditTask = (task) => {
        dispatch(openEditModal(task));
    };

    const handleMarkComplete = (todo) => {
        dispatch(markTodoCompleted(todo._id));
    };


    const totalActiveTasks = categorizedTodos.pending.length;
    const totalRepeatingTemplates = repeatingTasks.length;

    return (
        <div className="p-4 md:p-8 min-h-screen max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-3">
                Tasks & Templates
            </h1>

            {/* --- Status Bar and Action --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <p className="text-sm text-gray-400">Active Todos: <span className="font-bold text-indigo-300">{totalActiveTasks}</span></p>
                    <p className="text-sm text-gray-400">Repeating Templates: <span className="font-bold text-teal-300">{totalRepeatingTemplates}</span></p>
                </div>
                
                <button
                    className="w-full sm:w-auto py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 font-semibold text-white transition-colors flex items-center justify-center gap-2"
                    onClick={() => dispatch(toggleFormModal(true))} 
                >
                    <Plus size={20} /> Add Task/Template
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

            {/* --- Todo List: Pending & Expired --- */}
            <GlassCard className="mb-6 p-0 overflow-hidden">
                <h2 className="text-xl font-bold text-indigo-400 p-4 border-b border-gray-700/50 flex items-center gap-2">
                    <Calendar size={20} /> Pending Todos ({categorizedTodos.pending.length})
                </h2>
                <div className="divide-y divide-gray-700/50">
                    {categorizedTodos.pending.length === 0 ? (
                        <p className="p-4 text-gray-500 italic">You're all caught up! Create a new task.</p>
                    ) : (
                        categorizedTodos.pending.map(todo => (
                            <TaskItem key={todo._id} task={todo} onEdit={handleEditTask} onComplete={handleMarkComplete} />
                        ))
                    )}
                </div>

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

            {/* --- Repeating Task Templates List --- */}
            {/* <GlassCard className="p-0 overflow-hidden">
                <h2 className="text-xl font-bold text-teal-400 p-4 border-b border-gray-700/50 flex items-center gap-2">
                    <Repeat size={20} /> Repeating Templates ({totalRepeatingTemplates})
                </h2>
                <div className="divide-y divide-gray-700/50">
                    {repeatingTasks.length === 0 ? (
                        <p className="p-4 text-gray-500 italic">No task templates defined. Start building routines!</p>
                    ) : (
                        repeatingTasks.map(template => (
                            <TaskItem key={template._id} task={template} onEdit={handleEditTask} />
                        ))
                    )}
                </div>
            </GlassCard> */}
            
            {/* Modals */}
            {isFormModalOpen && <TaskFormModal isOpen={isFormModalOpen} onClose={() => dispatch(toggleFormModal(false))} />}
            {isEditModalOpen && <TaskEditModal />}
        </div>
    );
}
