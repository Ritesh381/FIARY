import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, X, Loader2, Calendar, Clock, Tag, Repeat, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
    createTodoEntry, 
    createRepeatingTaskEntry 
} from '../../redux/slices/todoSlice';

const GlassCard = ({ children, className = "", ...props }) => (
    <div {...props} className={`bg-white/10 backdrop-blur-lg border border-gray-700 rounded-xl shadow-xl ${className}`}>
        {children}
    </div>
);

// Helper to get current date/time in YYYY-MM-DDTHH:mm format for min/max attributes
const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function TaskFormModal({ isOpen, onClose }) {
    const dispatch = useDispatch();

    const [taskType, setTaskType] = useState('oneTime'); // 'oneTime' or 'repeating'
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        // For one-time tasks:
        frequency: 'daily', // Default frequency for one-time todo (affects expiry, see Todo.models.js)
        // For repeating tasks:
        taskFrequencyToCreate: 'daily',
        repeatSchedule: {
            type: 'daily',
            daysOfWeek: [],
            dayOfMonth: undefined,
        },
    });
    
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, message: null });

    const isRepeating = taskType === 'repeating';

    const handleTypeChange = (type) => {
        setTaskType(type);
        setFeedback({ type: null, message: null });
        // Reset specific fields when switching type
        setFormData(prev => ({
            ...prev,
            frequency: 'daily',
            taskFrequencyToCreate: 'daily',
            repeatSchedule: { type: 'daily', daysOfWeek: [], dayOfMonth: undefined },
        }));
    };

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
        const currentDays = formData.repeatSchedule.daysOfWeek;
        const updatedDays = currentDays.includes(dayIndex)
            ? currentDays.filter(d => d !== dayIndex)
            : [...currentDays, dayIndex].sort((a, b) => a - b);
        
        handleScheduleChange('daysOfWeek', updatedDays);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: null, message: null });

        if (!formData.title) {
            setFeedback({ type: 'error', message: 'Task Title is required.' });
            return;
        }
        
        if (isRepeating && formData.repeatSchedule.type === 'weekly' && formData.repeatSchedule.daysOfWeek.length === 0) {
             setFeedback({ type: 'error', message: 'Weekly repeating tasks must select at least one day.' });
            return;
        }

        setSubmitting(true);
        let action;
        let payload;

        if (isRepeating) {
            payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                taskFrequencyToCreate: formData.taskFrequencyToCreate,
                repeatSchedule: formData.repeatSchedule,
                // startDate and endDate can be added here if fields were included
            };
            action = createRepeatingTaskEntry;
        } else {
            payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                frequency: formData.frequency,
            };
            action = createTodoEntry;
        }
        
        try {
            await dispatch(action(payload)).unwrap();
            setFeedback({ type: 'success', message: `${isRepeating ? 'Repeating Task' : 'Todo'} created successfully!` });
            
            // Reset form and close modal
            setFormData({
                title: '', description: '', category: '', frequency: 'daily',
                taskFrequencyToCreate: 'daily',
                repeatSchedule: { type: 'daily', daysOfWeek: [], dayOfMonth: undefined }
            });
            setTimeout(onClose, 1000); 

        } catch (error) {
            setFeedback({ type: 'error', message: error.message || `Failed to create ${taskType} task.` });
        } finally {
            setSubmitting(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div
            id="task-modal-backdrop" 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden z-50 transition-opacity duration-300"
            onClick={(e) => {
                if (e.target.id === 'task-modal-backdrop') {
                    onClose();
                }
            }}
        >
            <GlassCard 
                className="relative w-full max-w-xs p-4 sm:p-5 transform transition-transform scale-100 duration-300 max-h-[95vh] overflow-y-auto" // Max width reduced to xs, padding reduced
                onClick={(e) => e.stopPropagation()} 
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors p-1" // Reduced padding
                    aria-label="Close modal"
                    disabled={submitting}
                >
                    <X size={20} /> {/* Reduced icon size */}
                </button>

                <h2 className="text-xl font-bold text-teal-400 mb-4 text-center flex items-center justify-center gap-2 pt-2"> {/* Reduced font size and margin */}
                    <Plus size={20} /> Create New Task
                </h2>

                {/* --- Task Type Selector --- */}
                <div className="flex gap-2 p-1 bg-gray-900/50 rounded-lg border border-gray-700 mb-4"> {/* Reduced gap and margin */}
                    <button 
                        type="button" 
                        onClick={() => handleTypeChange('oneTime')}
                        className={`flex-1 py-1.5 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 ${taskType === 'oneTime' ? 'bg-indigo-600 shadow-md text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        disabled={submitting}
                    >
                        <Calendar size={14} /> Todo
                    </button>
                    <button 
                        type="button" 
                        onClick={() => handleTypeChange('repeating')}
                        className={`flex-1 py-1.5 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 ${taskType === 'repeating' ? 'bg-teal-600 shadow-md text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        disabled={submitting}
                    >
                        <Repeat size={14} /> Repeating
                    </button>
                </div>

                {/* Inline Feedback Display */}
                {feedback.message && (
                    <div className={`flex items-center gap-2 p-2 rounded-lg mb-3 text-xs font-medium ${ // Reduced padding and font size
                        feedback.type === 'success'
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                    }`}>
                        {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        <p>{feedback.message}</p>
                    </div>
                )}
                
                <form onSubmit={handleFormSubmit} className="space-y-3"> {/* Reduced spacing */}
                    
                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="block text-xs font-medium text-gray-300 mb-1">Title <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Meditate for 10 minutes (Required)"
                            className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors" // Reduced padding and font size
                            required
                            disabled={submitting}
                        />
                    </div>
                    
                    {/* Category Input */}
                    <div>
                        <label htmlFor="category" className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1"><Tag size={12} /> Category</label> {/* Reduced icon size and gap */}
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="e.g., Health, Work"
                            className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors" // Reduced padding and font size
                            disabled={submitting}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="2" 
                            placeholder="Optional details" // Shortened placeholder
                            className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors resize-none" // Reduced padding and font size
                            disabled={submitting}
                        />
                    </div>

                    {/* --- Repeating Task Schedule --- */}
                    {isRepeating && (
                        <GlassCard className="p-3 space-y-2"> {/* Reduced padding and spacing */}
                            <h3 className="text-sm font-semibold text-teal-300 flex items-center gap-1"> {/* Reduced font size */}
                                <Repeat size={14} /> Repetition Settings
                            </h3>
                            
                            {/* Frequency to Create */}
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Create Next Todo</label>
                                <select
                                    name="taskFrequencyToCreate"
                                    value={formData.taskFrequencyToCreate}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors" // Reduced padding and font size
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
                                    {['daily', 'weekly', 'monthly'].map(type => (
                                        <button 
                                            key={type}
                                            type="button"
                                            onClick={() => handleScheduleChange('type', type)}
                                            className={`flex-1 py-1.5 rounded-lg font-medium text-xs transition-colors duration-200 ${ // Reduced padding and font size
                                                formData.repeatSchedule.type === type ? 'bg-indigo-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                            }`}
                                            disabled={submitting}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Weekly Schedule Picker */}
                            {formData.repeatSchedule.type === 'weekly' && (
                                <div className="pt-1"> {/* Reduced padding */}
                                    <label className="block text-xs font-medium text-gray-300 mb-1">Days: <span className="text-red-400">*</span></label>
                                    <div className="grid grid-cols-7 gap-1">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                                            const isSelected = formData.repeatSchedule.daysOfWeek.includes(index);
                                            return (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleDayOfWeekToggle(index)}
                                                    className={`w-full py-1.5 rounded-lg font-bold text-xs transition-colors duration-200 ${ // Reduced padding
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
                            {formData.repeatSchedule.type === 'monthly' && (
                                <div className="pt-1"> {/* Reduced padding */}
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
                                        className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors" // Reduced padding and font size
                                        disabled={submitting}
                                    />
                                </div>
                            )}
                            
                        </GlassCard>
                    )}
                    
                    {/* --- One-Time Task Expiry --- */}
                    {!isRepeating && (
                         <GlassCard className="p-3 space-y-2"> {/* Reduced padding and spacing */}
                            <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-1"><Calendar size={14} /> Expiry Window</h3> {/* Reduced font size and icon size */}
                            <p className='text-xs text-gray-400 mb-2'> {/* Reduced font size */}
                                This determines when this task will automatically expire. 
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Expires after</label>
                                <select
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-600 transition-colors" // Reduced padding and font size
                                    disabled={submitting}
                                >
                                    <option value="daily">End of Today</option>
                                    <option value="weekly">End of This Week</option>
                                    <option value="monthly">End of This Month</option>
                                </select>
                            </div>
                         </GlassCard>
                    )}


                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || feedback.type === 'success'}
                        className={`w-full py-2 px-4 rounded-lg text-white font-bold transition duration-300 flex items-center justify-center gap-2 text-sm ${ // Reduced padding and font size
                            submitting || feedback.type === 'success'
                                ? "bg-teal-700/50 cursor-not-allowed"
                                : "bg-teal-600 hover:bg-teal-500"
                        }`}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Creating...
                            </>
                        ) : feedback.type === 'success' ? (
                            <>
                                <CheckCircle size={16} /> Success!
                            </>
                        ) : (
                            <>
                                <Plus size={16} /> Create {isRepeating ? 'Repeating Task' : 'Todo'}
                            </>
                        )}
                    </button>
                </form>
            </GlassCard>
        </div>
    );
}
