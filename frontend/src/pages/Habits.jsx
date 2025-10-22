import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Check, X, Edit3, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import apiHabits from "../api/HabitCalls"
import AddHabitModal from "../components/AddHabit"
import EditHabitModal from "../components/EditHabit"

const GlobalStyles = () => (
    <style>{`
        body {
            font-family: 'Inter', sans-serif;
            background: #0D1117;
            background: radial-gradient(circle, rgba(13,42,66,0.8) 0%, #0D1117 70%);
            color: #c9d1d9;
        }
        .glass-card {
            background: rgba(22, 27, 34, 0.6);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            /* DESIGN FIX: Added a more visible border for better differentiation */
            border: 1px solid rgba(80, 88, 101, 0.5);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            border-radius: 16px;
        }
        .glass-button {
            background: rgba(34, 197, 94, 0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(34, 197, 94, 0.4);
            transition: all 0.2s ease-in-out;
        }
        .glass-button:hover {
            background: rgba(34, 197, 94, 0.4);
            border-color: rgba(34, 197, 94, 0.6);
        }
        .glass-select {
            background: rgba(32, 38, 48, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(56, 62, 74, 0.5);
        }
        .tooltip { position: relative; display: inline-block; }
        .tooltip .tooltip-text {
            visibility: hidden; width: 160px; background-color: #161B22; color: #fff; text-align: center;
            border-radius: 6px; padding: 8px; position: absolute; z-index: 1; bottom: 125%; left: 50%;
            margin-left: -80px; opacity: 0; transition: opacity 0.3s; border: 1px solid rgba(56, 62, 74, 0.8);
            font-size: 0.8rem;
        }
        .tooltip:hover .tooltip-text { visibility: visible; opacity: 1; }
        .habit-tracker-grid::-webkit-scrollbar { height: 8px; }
        .habit-tracker-grid::-webkit-scrollbar-track { background: rgba(22, 27, 34, 0.6); border-radius: 10px; }
        .habit-tracker-grid::-webkit-scrollbar-thumb { background: #2a3038; border-radius: 10px; }
        .habit-tracker-grid::-webkit-scrollbar-thumb:hover { background: #3e444c; }
    `}</style>
);

// --- Page Components ---

const HeaderControls = ({ onAddNew, currentDate, onMonthChange }) => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <button onClick={onAddNew} className="glass-button w-full md:w-auto text-green-300 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2">
            <Plus size={20} /> Add New Habit
        </button>
        <div className="flex items-center gap-2 glass-select p-1 rounded-lg">
             <button onClick={() => onMonthChange(-1)} className="p-2 rounded-md hover:bg-gray-700"><ChevronLeft size={20} /></button>
             <span className="font-semibold text-lg w-36 text-center">
                 {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </span>
             <button onClick={() => onMonthChange(1)} className="p-2 rounded-md hover:bg-gray-700"><ChevronRight size={20} /></button>
        </div>
    </div>
);

const HabitGrid = ({ title, habits, entries, currentDate, isQuitHabit = false }) => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    if (habits.length === 0) {
        return (
             <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="text-gray-400">No habits of this type yet. Add one to get started!</p>
            </div>
        )
    }

    return (
        <div className="glass-card p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="overflow-x-auto habit-tracker-grid">
                {/* --- DESIGN FIX 2: Corrected grid layout --- */}
                <div className="grid gap-x-2 text-sm text-center" style={{ gridTemplateColumns: `minmax(150px, 1fr) repeat(${daysInMonth}, minmax(32px, 1fr))` }}>
                    {/* Headers */}
                    <div className="sticky left-0 bg-gray-800/50 p-2 font-semibold text-left z-10">Habit</div>
                    {daysArray.map(day => <div key={day} className="p-2 w-8 flex items-center justify-center">{day}</div>)}
                    
                    {/* Rows */}
                    {habits.map(habit => {
                         const habitEntries = entries[habit._id] || [];
                         return (
                            <React.Fragment key={habit._id}>
                                <div className="sticky left-0 bg-gray-800/50 p-2 font-semibold text-left truncate z-10">{habit.title}</div>
                                {daysArray.map(day => {
                                    // Use getUTCDate for consistent date comparison across timezones
                                    const entry = habitEntries.find(e => new Date(e.date).getUTCDate() === day);
                                    let icon = <div className="w-6 h-6 rounded-full bg-gray-700/50 mx-auto"></div>;
                                    if(entry) {
                                        if(isQuitHabit) icon = <X className="text-red-400 mx-auto" />;
                                        else icon = <Check className="text-green-400 mx-auto" />;
                                    } else {
                                         if(isQuitHabit) icon = <Check className="text-green-400 mx-auto" />;
                                    }
                                    return (
                                        <div key={day} className="p-1 flex items-center justify-center">
                                             {entry?.notes ? (
                                                <div className="tooltip">{icon}<span className="tooltip-text">{entry.notes}</span></div>
                                            ) : icon}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const HabitManagementList = ({ habits, onEdit }) => (
    <div className="glass-card p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">Manage Habits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.filter(h => !h.isDeleted).map(habit => (
                <div key={habit._id} className="glass-card p-4 flex justify-between items-center border-l-4" style={{borderColor: habit.habitType === 'develop' ? '#22C55E' : '#EF4444'}}>
                    <div>
                        <span className="text-2xl mr-3">{habit.icon}</span>
                        <span className="font-semibold">{habit.title}</span>
                    </div>
                    <button onClick={() => onEdit(habit)} className="p-2 rounded-full hover:bg-gray-700">
                        <Edit3 size={18} />
                    </button>
                </div>
            ))}
        </div>
    </div>
);

// --- Main App Component ---
export default function HabitTracker() {
    const [habits, setHabits] = useState([]);
    const [entries, setEntries] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [status, setStatus] = useState('loading');
    
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState(null);

    useEffect(() => {
        const fetchAllHabits = async () => {
            try {
                setStatus('loading');
                const fetchedHabits = await apiHabits.getAllHabits();
                setHabits(fetchedHabits || []);
                setStatus('success');
            } catch (error) {
                console.error("Failed to fetch habits:", error);
                setStatus('error');
            }
        };
        fetchAllHabits();
    }, []);

    useEffect(() => {
        if (habits.length === 0 || status !== 'success') return;

        const fetchAllEntries = async () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1).toISOString();
            const endDate = new Date(year, month + 1, 0).toISOString();
            const entriesMap = {};
            await Promise.all(habits.map(async (habit) => {
                try {
                    const habitEntries = await apiHabits.getEntriesForHabit(habit._id, startDate, endDate);
                    entriesMap[habit._id] = habitEntries;
                } catch (error) {
                    console.error(`Failed to fetch entries for habit ${habit.title}`, error);
                    entriesMap[habit._id] = [];
                }
            }));
            setEntries(entriesMap);
        };

        fetchAllEntries();
    }, [habits, currentDate, status]);

    const handleMonthChange = (offset) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleHabitAdded = (newHabit) => setHabits(prev => [...prev, newHabit]);
    const handleHabitUpdated = (updatedHabit) => setHabits(prev => prev.map(h => h._id === updatedHabit._id ? updatedHabit : h));
    const handleHabitDeleted = (deletedHabitId) => setHabits(prev => prev.filter(h => h._id !== deletedHabitId));
    
    const openEditModal = (habit) => {
        setSelectedHabit(habit);
        setEditModalOpen(true);
    };

    const developHabits = useMemo(() => habits.filter(h => h.habitType === 'develop' && !h.isDeleted), [habits]);
    const quitHabits = useMemo(() => habits.filter(h => h.habitType === 'quit' && !h.isDeleted), [habits]);
    
    return (
        <div className="p-4 md:p-8 min-h-screen text-gray-300">
            <GlobalStyles />
            <HeaderControls 
                onAddNew={() => setAddModalOpen(true)}
                currentDate={currentDate}
                onMonthChange={handleMonthChange}
            />
            {status === 'loading' && <div className="text-center py-10">Loading habits...</div>}
            {status === 'error' && <div className="text-center py-10 text-red-400">Failed to load habits. Please try again later.</div>}
            {status === 'success' && (
                <div className="space-y-8">
                    <HabitGrid title="Develop" habits={developHabits} entries={entries} currentDate={currentDate} />
                    <HabitGrid title="Quit" habits={quitHabits} entries={entries} currentDate={currentDate} isQuitHabit={true} />
                    <HabitManagementList habits={habits} onEdit={openEditModal} />
                </div>
            )}
            <AddHabitModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onHabitAdded={handleHabitAdded} />
            <EditHabitModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} habit={selectedHabit} onHabitUpdated={handleHabitUpdated} onHabitDeleted={handleHabitDeleted} />
        </div>
    );
}

