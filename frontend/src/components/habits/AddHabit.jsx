import React, { useState } from 'react';
import { Plus, Check, AlertTriangle, X } from 'lucide-react';
import apiHabits from '../../api/HabitCalls';

const FormInput = ({ id, label, value, onChange, placeholder, type = 'text', required = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label} {required && <span className="text-red-400">*</span>}</label>
        <input 
            type={type} 
            id={id} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            required={required}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors" 
            />
    </div>
);

export default function AddHabitModal({ isOpen, onClose, onHabitAdded }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [habitType, setHabitType] = useState('develop');
    
    // State for inline feedback
    const [feedback, setFeedback] = useState({ type: null, message: null }); // {type: 'error' | 'success', message: '...'}
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setIcon('');
        setHabitType('develop');
        setFeedback({ type: null, message: null });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: null, message: null }); // Clear previous feedback

        if (!title || !icon || !habitType) {
            setFeedback({ type: 'error', message: 'Title, Icon, and Habit Type are required.' });
            return;
        }
        
        setIsLoading(true);
        
        try {
            const newHabit = await apiHabits.createHabit({ title, description, icon, habitType });
            onHabitAdded(newHabit);
            setFeedback({ type: 'success', message: 'Habit created successfully!' });
            
            // Auto-close after a short delay for success visualization
            setTimeout(handleClose, 1000); 

        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Failed to create habit. Please try again.';
            setFeedback({ type: 'error', message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 transition-opacity duration-300" 
            onClick={handleClose}
        >
            <div 
                className="relative w-full max-w-md bg-white/10 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-6 md:p-8 text-white transform transition-transform duration-300 scale-100" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={handleClose} 
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-green-400">
                    <Plus size={24} className="text-white" /> Add New Habit
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormInput 
                        id="title" 
                        label="Habit Title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="e.g., Read for 15 minutes" 
                        required
                    />
                    <FormInput 
                        id="icon" 
                        label="Icon" 
                        value={icon} 
                        onChange={(e) => setIcon(e.target.value)} 
                        placeholder="e.g., 📚" 
                        required
                    />
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea 
                            id="description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="A short description of the habit" 
                            rows="3" 
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors" 
                        />
                    </div>
                    
                    {/* Habit Type Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Habit Type <span className="text-red-400">*</span></label>
                        <div className="flex gap-4 p-1 bg-gray-900/50 rounded-lg border border-gray-700">
                            <button 
                                type="button" 
                                onClick={() => setHabitType('develop')} 
                                className={`flex-1 py-2 rounded-lg font-medium transition-colors duration-200 text-sm md:text-base ${habitType === 'develop' ? 'bg-green-600 shadow-md text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                            >
                                Develop (Start doing)
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setHabitType('quit')} 
                                className={`flex-1 py-2 rounded-lg font-medium transition-colors duration-200 text-sm md:text-base ${habitType === 'quit' ? 'bg-red-600 shadow-md text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                            >
                                Quit (Stop doing)
                            </button>
                        </div>
                    </div>
                    
                    {/* Inline Feedback */}
                    {feedback.message && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${feedback.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                            {feedback.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} />}
                            <p className="font-medium">{feedback.message}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            className="py-2 px-5 bg-gray-600/50 rounded-lg hover:bg-gray-500/50 transition-colors font-medium text-white"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading || feedback.type === 'success'} 
                            className={`py-2 px-5 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 ${isLoading || feedback.type === 'success' ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Creating...
                                </>
                            ) : feedback.type === 'success' ? (
                                <>
                                    <Check size={18} />
                                    Done
                                </>
                            ) : (
                                'Create Habit'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}