import React, { useState, useEffect } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import apiHabits from '../api/HabitCalls';

const FormInput = ({ id, label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input type={type} id={id} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" />
    </div>
);

export default function EditHabitModal({ isOpen, onClose, habit, onHabitUpdated, onHabitDeleted }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (habit) {
            setTitle(habit.title);
            setDescription(habit.description || '');
            setIcon(habit.icon);
        }
    }, [habit]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiHabits.updateHabit(habit._id, { title, description, icon });
            onHabitUpdated(response.entry);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update habit.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete the habit "${habit.title}"?`)) return;
        setIsLoading(true);
        setError(null);
        try {
            await apiHabits.deleteHabit(habit._id);
            onHabitDeleted(habit._id);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete habit.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !habit) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="glass-card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Edit3 /> Edit Habit</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <FormInput id="edit-title" label="Habit Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <FormInput id="edit-icon" label="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} />
                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                    <div className="flex justify-between items-center pt-4">
                        <button type="button" onClick={handleDelete} disabled={isLoading} className="py-2 px-4 bg-red-800/80 text-white rounded-lg flex items-center gap-2 hover:bg-red-700/80 transition-colors disabled:bg-gray-500"><Trash2 size={16} /> Delete</button>
                        <div className="flex gap-4">
                            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600/50 rounded-lg hover:bg-gray-500/50 transition-colors">Cancel</button>
                            <button type="submit" disabled={isLoading} className="py-2 px-4 bg-green-600/80 rounded-lg font-semibold hover:bg-green-500/80 transition-colors disabled:bg-gray-500">{isLoading ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
