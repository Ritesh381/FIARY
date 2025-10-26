import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    X, Loader2, Calendar, Tag, Repeat, AlertTriangle, CheckCircle, Edit3, Trash2, Pause, Play 
} from 'lucide-react';
import { 
    closeEditModal,
    updateTodoEntry,
    deleteTodoEntry,
    updateRepeatingTaskEntry,
    deleteRepeatingTaskEntry,
    toggleRepeatingTaskStatus,
    fetchTodos,
    fetchRepeatingTasks
} from '../../redux/slices/todoSlice';

const GlassCard = ({ children, className = "", ...props }) => (
    <div {...props} className={`bg-white/10 backdrop-blur-lg border border-gray-700 rounded-xl shadow-xl ${className}`}>
        {children}
    </div>
);

// Helper function to format days of week array (0=Sun)
const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function TaskEditModal() {
    const dispatch = useDispatch();
    const { isEditModalOpen, selectedTask } = useSelector(state => state.todo);
    
    const [formData, setFormData] = useState({});
    const [taskType, setTaskType] = useState(null); // 'todo' or 'repeating'
    
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, message: null });
    
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
    const [deleting, setDeleting] = useState(false); 

    // --- Effect to Initialize Form Data ---
    useEffect(() => {
        if (selectedTask) {
            const isRepeating = selectedTask.repeatSchedule !== undefined;
            const type = isRepeating ? 'repeating' : 'todo';
            setTaskType(type);

            if (isRepeating) {
                setFormData({
                    _id: selectedTask._id,
                    title: selectedTask.title || '',
                    description: selectedTask.description || '',
                    category: selectedTask.category || '',
                    isActive: selectedTask.isActive || false, // Specific to repeating tasks
                    taskFrequencyToCreate: selectedTask.taskFrequencyToCreate || 'daily',
                    repeatSchedule: selectedTask.repeatSchedule || { type: 'daily', daysOfWeek: [], dayOfMonth: undefined },
                });
            } else {
                setFormData({
                    _id: selectedTask._id,
                    title: selectedTask.title || '',
                    description: selectedTask.description || '',
                    category: selectedTask.category || '',
                    frequency: selectedTask.frequency || 'daily',
                    status: selectedTask.status || 'pending', // Specific to todos
                });
            }
            setFeedback({ type: null, message: null });
        }
    }, [selectedTask]);

    const isRepeatingTask = taskType === 'repeating';
    const currentScheduleType = formData.repeatSchedule?.type;

    // --- Form and Schedule Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFeedback({ type: null, message: null });
    };

    const handleScheduleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            repeatSchedule: {
                ...prev.repeatSchedule,
                [field]: value,
            },
        }));
        setFeedback({ type: null, message: null });
    };
    
    const handleDayOfWeekToggle = (dayIndex) => {
        const currentDays = formData.repeatSchedule.daysOfWeek || [];
        const updatedDays = currentDays.includes(dayIndex)
            ? currentDays.filter(d => d !== dayIndex)
            : [...currentDays, dayIndex].sort((a, b) => a - b);
        
        handleScheduleChange('daysOfWeek', updatedDays);
    };

    // --- Main Update Logic ---
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: null, message: null });

        if (!formData.title) {
            setFeedback({ type: 'error', message: 'Task Title is required.' });
            return;
        }

        setSubmitting(true);
        const { _id, ...updates } = formData;
        
        try {
            if (isRepeatingTask) {
                // Ensure daysOfWeek is not null for weekly schedules
                if (updates.repeatSchedule.type === 'weekly' && updates.repeatSchedule.daysOfWeek?.length === 0) {
                     setFeedback({ type: 'error', message: 'Weekly repeating tasks must select at least one day.' });
                     setSubmitting(false);
                     return;
                }
                await dispatch(updateRepeatingTaskEntry({ id: _id, updates })).unwrap();
                dispatch(fetchRepeatingTasks());
            } else {
                await dispatch(updateTodoEntry({ id: _id, updates })).unwrap();
                dispatch(fetchTodos());
            }
            
            setFeedback({ type: 'success', message: 'Task updated successfully!' });
            setTimeout(() => dispatch(closeEditModal()), 1000);

        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Failed to update task.' });
        } finally {
            setSubmitting(false);
        }
    };
    
    // --- Delete/Toggle Logic ---
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
            if (isRepeatingTask) {
                await dispatch(deleteRepeatingTaskEntry(formData._id)).unwrap();
                dispatch(fetchRepeatingTasks());
            } else {
                // For a Todo, we use soft delete
                await dispatch(deleteTodoEntry(formData._id)).unwrap();
                dispatch(fetchTodos());
            }

            setFeedback({ type: 'success', message: 'Task deleted successfully!' });
            setTimeout(() => dispatch(closeEditModal()), 1000);

        } catch (error) {
            setFeedback({ type: 'error', message: 'Failed to delete task.' });
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!isRepeatingTask || submitting) return;
        setSubmitting(true);

        try {
            await dispatch(toggleRepeatingTaskStatus(formData._id)).unwrap();
            setFeedback({ type: 'success', message: `Task ${formData.isActive ? 'paused' : 'resumed'}!` });
            
            // Optimistically update local state for immediate feedback
            setFormData(prev => ({ ...prev, isActive: !prev.isActive })); 
            dispatch(fetchRepeatingTasks()); 

        } catch (error) {
            setFeedback({ type: 'error', message: 'Failed to toggle status.' });
        } finally {
            setSubmitting(false);
        }
    };

    // --- Dynamic Content & Helpers ---
    const deleteMessage = isRepeatingTask 
        ? "This will delete the repeating template and prevent future Todos from being created." 
        : "This will permanently remove this one-time Todo.";
    
    const confirmationSignature = `DELETE ${isRepeatingTask ? 'REPEATING' : 'TODO'} TASK: ${formData.title}`;
    
    if (!isEditModalOpen || !selectedTask) return null;


    return (
        <div
            id="task-edit-modal-backdrop" 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50 transition-opacity duration-300"
            onClick={(e) => {
                if (e.target.id === 'task-edit-modal-backdrop') {
                    dispatch(closeEditModal());
                }
            }}
        >
            
            {/* --- Delete Confirmation Modal --- */}
            {showDeleteConfirm && (
                <div
                    className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-2xl p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white/10 backdrop-blur-lg border border-red-500 rounded-xl p-6 md:p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4"><Trash2 size={24}/> Confirm Deletion</h3>
                        <p className="text-gray-300 my-4 text-sm">{deleteMessage}</p>
                        <p className="text-gray-400 text-xs mb-3">
                            Type the following to confirm:
                            <code className="text-amber-400 font-mono bg-gray-700/50 p-1 rounded block mt-1 select-all text-sm break-all">
                                {confirmationSignature}
                            </code>
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmInput}
                            onChange={(e) => setDeleteConfirmInput(e.target.value)}
                            className="w-full p-2 rounded-lg bg-gray-800/70 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                            placeholder="Type the confirmation phrase here..."
                            disabled={deleting}
                        />
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={() => {if (!deleting) setShowDeleteConfirm(false)}}
                                className="py-2 px-3 rounded-lg text-white font-semibold transition bg-gray-600/50 hover:bg-gray-500/50"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleteConfirmInput !== confirmationSignature || deleting}
                                className="py-2 px-3 rounded-lg text-white font-bold transition bg-red-600 hover:bg-red-700 flex items-center gap-1 text-sm disabled:bg-red-800/50"
                            >
                                {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Main Edit Form Modal --- */}
            <GlassCard 
                className="relative w-full max-w-xs p-4 sm:p-5 transform transition-transform scale-100 duration-300 max-h-[95vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} 
            >
                <button
                    onClick={() => dispatch(closeEditModal())}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors p-1"
                    aria-label="Close modal"
                    disabled={submitting}
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-teal-400 mb-4 text-center flex items-center justify-center gap-2 pt-2">
                    <Edit3 size={20} /> Edit {isRepeatingTask ? 'Template' : 'Todo'}
                </h2>

                {/* Inline Feedback Display */}
                {feedback.message && (
                    <div className={`flex items-center gap-2 p-2 rounded-lg mb-3 text-xs font-medium ${
                        feedback.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                        {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        <p>{feedback.message}</p>
                    </div>
                )}
                
                <form onSubmit={handleUpdateSubmit} className="space-y-3">
                    
                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="block text-xs font-medium text-gray-300 mb-1">Title <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title || ''}
                            onChange={handleChange}
                            className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
                            required
                            disabled={submitting}
                        />
                    </div>
                    
                    {/* Category Input */}
                    <div>
                        <label htmlFor="category" className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1"><Tag size={12} /> Category</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category || ''}
                            onChange={handleChange}
                            placeholder="e.g., Health, Work"
                            className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
                            disabled={submitting}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows="2" 
                            placeholder="Optional details"
                            className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors resize-none"
                            disabled={submitting}
                        />
                    </div>

                    {/* --- Repeating Task Schedule (Editable by Template) --- */}
                    {isRepeatingTask && (
                        <GlassCard className="p-3 space-y-2">
                            <h3 className="text-sm font-semibold text-teal-300 flex items-center gap-1">
                                <Repeat size={14} /> Repetition Settings
                            </h3>
                            
                            {/* Toggle Active Status */}
                            <div className="pt-1">
                                <label className="block text-xs font-medium text-gray-300 mb-1">Status</label>
                                <button
                                    type="button"
                                    onClick={handleToggleStatus}
                                    className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors duration-200 ${
                                        formData.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
                                    }`}
                                    disabled={submitting}
                                >
                                    {formData.isActive ? <Pause size={16} /> : <Play size={16} />} 
                                    {formData.isActive ? 'Active (Click to Pause)' : 'Paused (Click to Resume)'}
                                </button>
                            </div>

                            {/* Frequency to Create */}
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Create Next Todo</label>
                                <select
                                    name="taskFrequencyToCreate"
                                    value={formData.taskFrequencyToCreate || 'daily'}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
                                    disabled={submitting}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            {/* Repeat Schedule Type (Daily, Weekly, Monthly) */}
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Pattern</label>
                                <div className="flex space-x-2">
                                    {['daily', 'weekly', 'monthly'].map((type) => (
                                        <button 
                                            key={type}
                                            type="button"
                                            onClick={() => handleScheduleChange('type', type)}
                                            className={`flex-1 py-1.5 rounded-lg font-medium text-xs transition-colors duration-200 ${
                                                currentScheduleType === type ? 'bg-indigo-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                            }`}
                                            disabled={submitting}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Weekly Schedule Picker */}
                            {currentScheduleType === 'weekly' && (
                                <div className="pt-1">
                                    <label className="block text-xs font-medium text-gray-300 mb-1">Days: <span className="text-red-400">*</span></label>
                                    <div className="grid grid-cols-7 gap-1">
                                        {dayNames.map((day, index) => {
                                            const isSelected = formData.repeatSchedule.daysOfWeek?.includes(index);
                                            return (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleDayOfWeekToggle(index)}
                                                    className={`w-full py-1.5 rounded-lg font-bold text-xs transition-colors duration-200 ${
                                                        isSelected ? 'bg-teal-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                                                    }`}
                                                    disabled={submitting}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Monthly Schedule Picker */}
                            {currentScheduleType === 'monthly' && (
                                <div className="pt-1">
                                    <label htmlFor="dayOfMonth" className="block text-xs font-medium text-gray-300 mb-1">Day of Month (1-31)</label>
                                    <input
                                        type="number"
                                        id="dayOfMonth"
                                        name="dayOfMonth"
                                        value={formData.repeatSchedule.dayOfMonth || ''}
                                        onChange={(e) => handleScheduleChange('dayOfMonth', parseInt(e.target.value) || undefined)}
                                        min="1"
                                        max="31"
                                        placeholder="15"
                                        className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
                                        disabled={submitting}
                                    />
                                </div>
                            )}
                            
                        </GlassCard>
                    )}
                    
                    {/* --- One-Time Task Expiry (Editable by Todo) --- */}
                    {!isRepeatingTask && (
                         <GlassCard className="p-3 space-y-2">
                            <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-1"><Calendar size={14} /> Expiry Window</h3>
                            <p className='text-xs text-gray-400 mb-2'>
                                This determines when this task will automatically expire.
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Expires after</label>
                                <select
                                    name="frequency"
                                    value={formData.frequency || 'daily'}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors"
                                    disabled={submitting}
                                >
                                    <option value="daily">End of Today</option>
                                    <option value="weekly">End of This Week</option>
                                    <option value="monthly">End of This Month</option>
                                </select>
                            </div>
                            {/* Current Status (Read-only) */}
                            <div className="pt-1">
                                <p className="text-xs font-medium text-gray-300">Status:</p>
                                <span className={`inline-block py-1 px-3 rounded-full text-xs font-bold ${
                                    formData.status === 'completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-gray-900'
                                }`}>
                                    {formData.status?.toUpperCase()}
                                </span>
                            </div>
                         </GlassCard>
                    )}


                    {/* Action Buttons */}
                    <div className="flex justify-between space-x-3 pt-3">
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="py-2 px-3 rounded-lg text-white font-bold transition duration-300 bg-red-600 hover:bg-red-700 flex items-center gap-1 text-sm"
                            disabled={submitting}
                        >
                            <Trash2 size={16}/> Delete
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => dispatch(closeEditModal())}
                                className="py-2 px-3 rounded-lg text-white font-bold transition duration-300 bg-gray-600/50 hover:bg-gray-500/50 text-sm"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`py-2 px-3 rounded-lg text-white font-bold transition duration-300 flex items-center gap-1 text-sm ${
                                    submitting || feedback.type === 'success'
                                        ? "bg-teal-700/50 cursor-not-allowed"
                                        : "bg-teal-600 hover:bg-teal-500"
                                }`}
                                disabled={submitting || feedback.type === 'success'}
                            >
                                {submitting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : feedback.type === 'success' ? (
                                    <CheckCircle size={16} />
                                ) : (
                                    <Edit3 size={16} />
                                )}
                                {submitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
