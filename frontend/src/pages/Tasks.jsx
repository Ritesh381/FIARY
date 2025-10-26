import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchTodos, 
    fetchRepeatingTasks, 
    markTodoCompleted, 
    deleteTodoEntry, 
    toggleRepeatingTaskStatus,
    deleteRepeatingTaskEntry
} from '../redux/slices/todoSlice';
import { Plus, CheckCircle, Clock, Repeat, Loader2, AlertTriangle, ListChecks, Edit3, Trash2, Pause, Play } from 'lucide-react';
import TaskFormModal from '../components/tasks/TaskFormModal';

const GlassCard = ({ children, className = "" }) => (
    <div
        className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/10 ${className}`}
    >
        {children}
    </div>
);

// Helper to calculate time remaining
const getExpirationMessage = (expiresAt) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();

    if (diffMs < 0) return { text: "Expired", color: "text-red-400" };

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) return { text: `${diffDays} days remaining`, color: "text-amber-400" };
    if (diffHours > 0) return { text: `${diffHours} hours remaining`, color: "text-amber-400" };
    return { text: "Due soon", color: "text-red-400" };
};


// --- Todo Item Component ---
const TodoItem = ({ todo, onComplete, onDelete }) => {
    const expired = todo.status !== 'completed' && new Date(todo.expiresAt) < new Date();
    const expiration = getExpirationMessage(todo.expiresAt);

    return (
        <div className={`flex items-center justify-between p-3 rounded-xl mb-3 transition-all ${
            todo.status === 'completed' 
            ? 'bg-green-900/50 border border-green-700/50 line-through opacity-70' 
            : expired 
            ? 'bg-red-900/50 border border-red-700/50'
            : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50'
        }`}>
            {/* Left side: Checkbox, Title, Category */}
            <div className='flex items-center space-x-4 min-w-0 flex-1'>
                <button
                    onClick={() => onComplete(todo._id)}
                    className={`p-2 rounded-full flex-shrink-0 transition-colors ${
                        todo.status === 'completed' 
                        ? 'bg-green-600 text-white' 
                        : 'border border-gray-500 text-transparent hover:border-white'
                    }`}
                    disabled={todo.status === 'completed'}
                    aria-label={`Mark ${todo.title} as completed`}
                >
                    <CheckCircle size={20} />
                </button>
                <div className='min-w-0'>
                    <p className={`font-semibold truncate ${todo.status === 'completed' ? 'text-gray-400' : 'text-white'}`}>
                        {todo.title}
                    </p>
                    <p className={`text-xs text-gray-500 ${todo.status === 'completed' ? 'hidden' : ''}`}>
                        {todo.category && <span className='mr-2 font-medium text-teal-300'>{todo.category}</span>}
                        {todo.expiresAt && <span className={expiration.color}><Clock size={12} className='inline mr-1' />{expiration.text}</span>}
                    </p>
                </div>
            </div>

            {/* Right side: Delete/Edit */}
            <div className='flex items-center space-x-2'>
                <button
                    onClick={() => { /* Implement Edit Modal here */ }}
                    className='text-gray-500 hover:text-blue-400 transition-colors p-1'
                    aria-label={`Edit ${todo.title}`}
                >
                    <Edit3 size={16} />
                </button>
                <button
                    onClick={() => onDelete(todo._id)}
                    className='text-gray-500 hover:text-red-400 transition-colors p-1'
                    aria-label={`Delete ${todo.title}`}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};


// --- Repeating Task Component ---
const RepeatingTaskItem = ({ task, onToggleStatus, onDelete }) => {
    const isActive = task.isActive;
    const days = task.repeatSchedule.daysOfWeek?.map((d) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d]).join(', ') || 'N/A';

    return (
        <div className={`flex items-center justify-between p-4 rounded-xl mb-3 transition-all ${
            isActive 
            ? 'bg-blue-900/40 border border-blue-700/50' 
            : 'bg-gray-800/50 border border-gray-700/50 opacity-70'
        }`}>
            {/* Left side: Icon, Title, Schedule */}
            <div className='flex items-center space-x-4 min-w-0 flex-1'>
                <Repeat size={24} className={`flex-shrink-0 ${isActive ? 'text-teal-400' : 'text-gray-500'}`} />
                <div className='min-w-0'>
                    <p className={`font-bold truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {task.title}
                    </p>
                    <p className='text-xs text-gray-500'>
                        Creates: <span className='font-medium'>{task.taskFrequencyToCreate}</span> | 
                        Repeats: <span className='font-medium text-indigo-300'>{task.repeatSchedule.type}</span> 
                        {task.repeatSchedule.type === 'weekly' && `: ${days}`}
                    </p>
                </div>
            </div>

            {/* Right side: Toggle, Delete */}
            <div className='flex items-center space-x-2 flex-shrink-0'>
                <button
                    onClick={() => onToggleStatus(task._id)}
                    className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                    aria-label={isActive ? 'Pause task' : 'Resume task'}
                >
                    {isActive ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                    onClick={() => onDelete(task._id)}
                    className='text-gray-500 hover:text-red-400 transition-colors p-1.5'
                    aria-label={`Delete repeating task ${task.title}`}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default function TasksPage() {
    const dispatch = useDispatch();
    const { todos, repeatingTasks, status, error } = useSelector(state => state.todo);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        dispatch(fetchTodos());
        dispatch(fetchRepeatingTasks());
    }, [dispatch]);
    
    // Group todos by status for display
    const { pending, completed } = useMemo(() => {
        return todos.reduce((acc, todo) => {
            if (todo.status === 'completed') {
                acc.completed.push(todo);
            } else {
                acc.pending.push(todo);
            }
            return acc;
        }, { pending: [], completed: [] });
    }, [todos]);

    // Handlers
    const handleCompleteTodo = (id) => dispatch(markTodoCompleted(id));
    const handleDeleteTodo = (id) => dispatch(deleteTodoEntry(id));
    const handleToggleTaskStatus = (id) => dispatch(toggleRepeatingTaskStatus(id));
    const handleDeleteRepeatingTask = (id) => dispatch(deleteRepeatingTaskEntry(id));


    return (
        <div className="p-4 md:p-8 min-h-screen max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-3">
                <ListChecks size={32} className="text-teal-400" /> Tasks & Habits
            </h1>

            {/* --- Global Controls --- */}
            <div className="flex justify-between items-center mb-6">
                <div className='text-gray-400 text-sm'>
                    {status === 'loading' ? (
                        <span className="flex items-center gap-2"><Loader2 size={16} className='animate-spin' /> Loading tasks...</span>
                    ) : (
                        `Active Todos: ${pending.length}`
                        // +` | Repeating: ${repeatingTasks.filter(t => t.isActive).length}`
                    )}
                </div>
                <button
                    className="py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 font-semibold text-white transition-colors flex items-center justify-center gap-2 text-sm"
                    onClick={() => setIsFormModalOpen(true)} 
                    aria-label="Add new task"
                >
                    <Plus size={20} /> Add Task
                </button>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg flex items-center gap-3 mb-6">
                    <AlertTriangle size={24} />
                    <p>Error loading data: {error}</p>
                </div>
            )}

            {/* --- Section: Current Todos --- */}
            <GlassCard className="mb-8">
                <h2 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
                    <ListChecks size={24} /> Today's Todos
                </h2>
                <div className="space-y-3 min-h-[100px]">
                    {pending.length === 0 ? (
                        <p className='text-gray-500 text-center py-6'>No pending tasks! Time to relax or add a new one.</p>
                    ) : (
                        pending.map(todo => (
                            <TodoItem 
                                key={todo._id} 
                                todo={todo} 
                                onComplete={handleCompleteTodo} 
                                onDelete={handleDeleteTodo} 
                            />
                        ))
                    )}
                </div>
            </GlassCard>

            {/* --- Section: Repeating Tasks --- */}
            {/* <GlassCard className="mb-8">
                <h2 className="text-2xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                    <Repeat size={24} /> Repeating Task Templates
                </h2>
                <div className="space-y-3 min-h-[100px]">
                    {repeatingTasks.length === 0 ? (
                        <p className='text-gray-500 text-center py-6'>No repeating tasks defined. Create one to automate your habits!</p>
                    ) : (
                        repeatingTasks.map(task => (
                            <RepeatingTaskItem 
                                key={task._id} 
                                task={task} 
                                onToggleStatus={handleToggleTaskStatus}
                                onDelete={handleDeleteRepeatingTask}
                            />
                        ))
                    )}
                </div>
            </GlassCard> */}
            
            {/* --- Section: Completed Todos (Hidden if empty) --- */}
            {completed.length > 0 && (
                <GlassCard className="mb-8 opacity-80">
                    <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                        <CheckCircle size={20} /> Completed ({completed.length})
                    </h2>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                        {completed.map(todo => (
                            <TodoItem 
                                key={todo._id} 
                                todo={todo} 
                                onComplete={handleCompleteTodo} 
                                onDelete={handleDeleteTodo} 
                            />
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* --- Modal --- */}
            {isFormModalOpen && <TaskFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} />}
        </div>
    );
}
