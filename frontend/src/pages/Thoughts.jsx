import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllThoughts, createThought, updateThought, deleteThought } from '../redux/slices/thoughtsSlice';
import { TfiThought } from 'react-icons/tfi';
import { Plus, Edit3, Trash2, Loader2, AlertTriangle, CheckCircle, Tag } from 'lucide-react';

const GlassCard = ({ children, className = "" }) => (
    <div
        className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/10 ${className}`}
    >
        {children}
    </div>
);

// --- Thought Form Component ---
const ThoughtForm = ({ initialData = {}, isEditing = false, onCancel, onSuccess }) => {
    const dispatch = useDispatch();
    
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        body: initialData.body || '',
        tags: (initialData.tags || []).join(', '),
    });
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, message: null });

    // FIX: Load initialData into formData when isEditing state changes.
    useEffect(() => {
        if (isEditing && initialData._id) {
            setFormData({
                title: initialData.title || '',
                body: initialData.body || '',
                tags: (initialData.tags || []).join(', '),
            });
        } else if (!isEditing) {
            // Clear the form completely when switching from edit mode to create mode
            setFormData({ title: '', body: '', tags: '' });
        }
    }, [isEditing, initialData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: null, message: null });
        if (!formData.title || !formData.body) {
            setFeedback({ type: 'error', message: 'Title and body are required.' });
            return;
        }

        setSubmitting(true);
        const processedTags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        
        const payload = { ...formData, tags: processedTags };
        
        try {
            if (isEditing) {
                await dispatch(updateThought({ id: initialData._id, updates: payload })).unwrap();
                setFeedback({ type: 'success', message: 'Thought updated!' });
            } else {
                await dispatch(createThought(payload)).unwrap();
                setFeedback({ type: 'success', message: 'Thought captured!' });
                // We no longer manually clear here, rely on the useEffect when onSuccess sets isEditing=false
            }
            onSuccess(); // Triggers parent to refresh list and potentially clear editingThought state
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || `Failed to ${isEditing ? 'update' : 'create'} thought.` });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
             {feedback.message && (
                <div className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
                    feedback.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                }`}>
                    {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    <p>{feedback.message}</p>
                </div>
            )}
            <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title (Required)"
                className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:ring-teal-400 border border-gray-600 transition-colors"
                disabled={submitting}
                required
            />
            <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Write your thought, idea, or reflection here..."
                rows="4"
                className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:ring-teal-400 border border-gray-600 transition-colors resize-none"
                disabled={submitting}
                required
            />
            <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Tags (e.g., idea, work, future) - separated by comma"
                className="w-full p-2 rounded-lg bg-gray-900/50 text-sm text-white focus:ring-teal-400 border border-gray-600 transition-colors"
                disabled={submitting}
            />
            
            <div className="flex justify-end space-x-3">
                {isEditing && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="py-2 px-3 rounded-lg text-white font-bold transition duration-300 bg-gray-600/50 hover:bg-gray-500/50 text-sm"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className={`py-2 px-3 rounded-lg text-white font-bold transition duration-300 flex items-center gap-1 text-sm ${
                        submitting ? "bg-teal-700/50 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-500"
                    }`}
                    disabled={submitting}
                >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : (isEditing ? <Edit3 size={16} /> : <Plus size={16} />)}
                    {isEditing ? 'Save Changes' : 'Capture Thought'}
                </button>
            </div>
        </form>
    );
};

// --- Thought Card Component ---
const ThoughtCard = ({ thought, onEditMode }) => {
    const dispatch = useDispatch();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await dispatch(deleteThought(thought._id)).unwrap();
        } catch (error) {
            console.error("Failed to delete thought:", error);
        } finally {
            setIsDeleting(false);
        }
    };
    
    // --- Delete Confirmation View ---
    if (isConfirming) {
        return (
            <GlassCard className="p-4 space-y-4 flex flex-col justify-center items-center bg-red-900/40 border-red-500">
                <p className="text-sm font-semibold text-white">Are you sure you want to delete this thought?</p>
                <div className="flex space-x-3 w-full">
                    <button
                        onClick={() => setIsConfirming(false)}
                        className="flex-1 py-2 rounded-lg text-white font-bold transition bg-gray-600 hover:bg-gray-700 text-sm"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 py-2 rounded-lg text-white font-bold transition bg-red-600 hover:bg-red-700 flex items-center justify-center gap-1 text-sm"
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        {isDeleting ? 'Deleting...' : 'Delete Forever'}
                    </button>
                </div>
            </GlassCard>
        );
    }
    
    // --- Normal View ---
    return (
        <GlassCard className="p-4 space-y-3 relative">
            <h3 className="text-lg font-bold text-teal-400 pr-10">{thought.title}</h3>
            <p className="text-gray-300 text-sm">{thought.body}</p>
            
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700/50">
                {(thought.tags || []).map((tag, index) => (
                    <span key={index} className="flex items-center text-xs text-indigo-300 bg-indigo-900/50 px-2 py-0.5 rounded-full">
                        <Tag size={12} className="mr-1" />{tag}
                    </span>
                ))}
            </div>
            
            <p className="text-xs text-gray-500">
                Captured: {new Date(thought.createdAt).toLocaleDateString('en-US', { dateStyle: 'short' })}
            </p>

            <div className="absolute top-2 right-2 flex space-x-2">
                <button 
                    onClick={() => onEditMode(thought)}
                    className="p-1 rounded-full text-gray-500 hover:text-white transition-colors"
                    aria-label="Edit thought"
                >
                    <Edit3 size={16} />
                </button>
                <button 
                    onClick={() => setIsConfirming(true)} // Trigger inline confirmation
                    className="p-1 rounded-full text-gray-500 hover:text-red-400 transition-colors"
                    aria-label="Delete thought"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </GlassCard>
    );
};

// --- MAIN PAGE ---
export default function ThoughtsPage() {
    const dispatch = useDispatch();
    const { items: thoughts, status, error } = useSelector(state => state.thoughts);
    
    const [editingThought, setEditingThought] = useState(null); // null or the thought object being edited

    useEffect(() => {
        dispatch(fetchAllThoughts());
    }, [dispatch]);
    
    const handleSuccess = () => {
        // After successful save/update, clear the editing state
        setEditingThought(null); 
    };
    
    const handleSetEditMode = (thought) => {
        // Only allow setting edit mode if the form is currently in 'Quick Capture' mode
        // OR if the user is clicking the same thought they are already editing.
        if (editingThought && editingThought._id !== thought._id) {
            // Optional: Add a subtle prompt/modal warning here about unsaved changes
            console.log("Warning: Clear current edit first.");
            // For now, we'll just set the new thought for editing, implicitly abandoning the unsaved changes of the previous one.
        }
        setEditingThought(thought);
    };

    const handleCancelEdit = () => {
        // When canceling edit, revert the form back to 'Quick Capture' mode
        setEditingThought(null);
    };

    return (
        <div className="p-4 md:p-8 min-h-screen max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-3">
                <TfiThought size={32} className="text-teal-400" /> Thoughts Vault
            </h1>
            
            {/* --- Thought Capture Form --- */}
            <GlassCard className="mb-8">
                <h2 className="text-2xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                    {editingThought ? 'Edit Thought' : 'Quick Capture'}
                </h2>
                <ThoughtForm 
                    // Pass the editing thought data when in edit mode
                    initialData={editingThought || {}}
                    isEditing={!!editingThought}
                    // Handle the cancel action to switch back to Quick Capture
                    onCancel={handleCancelEdit}
                    onSuccess={handleSuccess}
                />
            </GlassCard>

            {/* --- Thought List --- */}
            <h2 className="2xl font-bold text-white mb-4">
                Your Vault ({thoughts.length})
            </h2>

            {status === 'loading' && thoughts.length === 0 ? (
                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                    <Loader2 size={32} className="animate-spin mb-4" />
                    Loading thoughts...
                </div>
            ) : status === 'failed' && thoughts.length === 0 ? (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg flex items-center gap-3">
                    <AlertTriangle size={24} />
                    <p>{error || "Failed to load thoughts."}</p>
                </div>
            ) : thoughts.length === 0 ? (
                <GlassCard className="text-center py-10 text-gray-400 italic">
                    Your vault is empty! Capture your first idea above.
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {thoughts.map(thought => (
                        <ThoughtCard 
                            key={thought._id} 
                            thought={thought} 
                            onEditMode={handleSetEditMode} // Use the new handler
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
