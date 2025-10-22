import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import apiHabits from '../../api/HabitCalls';

const FormInput = ({ id, label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input type={type} id={id} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" />
    </div>
);

export default function AddHabitModal({ isOpen, onClose, onHabitAdded }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('💪');
    const [habitType, setHabitType] = useState('develop');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !icon || !habitType) {
            setError('Title, Icon, and Habit Type are required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const newHabit = await apiHabits.createHabit({ title, description, icon, habitType });
            onHabitAdded(newHabit);
            onClose();
            setTitle(''); setDescription(''); setIcon('💪'); setHabitType('develop');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create habit.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="glass-card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus /> Add New Habit</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput id="title" label="Habit Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Read for 15 minutes" />
                    <FormInput id="icon" label="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g., 📚" />
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description of the habit" rows="3" className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Habit Type</label>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setHabitType('develop')} className={`flex-1 py-2 rounded-lg transition-colors ${habitType === 'develop' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Develop</button>
                            <button type="button" onClick={() => setHabitType('quit')} className={`flex-1 py-2 rounded-lg transition-colors ${habitType === 'quit' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Quit</button>
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600/50 rounded-lg hover:bg-gray-500/50 transition-colors">Cancel</button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 bg-green-600/80 rounded-lg font-semibold hover:bg-green-500/80 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">{isLoading ? 'Saving...' : 'Create Habit'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
