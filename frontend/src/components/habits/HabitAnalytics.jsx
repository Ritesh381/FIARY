import React from 'react';
import { Edit3 } from 'lucide-react';

// Card color themes based on percentage
const getCardStyle = (percentage) => {
  if (percentage >= 80) {
    return {
      card: 'bg-green-900/30 border-green-700',
      text: 'text-green-300',
      progressBg: 'bg-green-700/50',
      progressFg: 'bg-green-400'
    };
  }
  if (percentage >= 50) {
    return {
      card: 'bg-yellow-900/30 border-yellow-700',
      text: 'text-yellow-300',
      progressBg: 'bg-yellow-700/50',
      progressFg: 'bg-yellow-400'
    };
  }
  return {
    card: 'bg-red-900/30 border-red-700',
    text: 'text-red-300',
    progressBg: 'bg-red-700/50',
    progressFg: 'bg-red-400'
  };
};

const AnalyticsCard = ({ habit, stats, onEdit }) => {
  if (!stats) return null;

  const { percentage, daysDone, longestStreak, feedback } = stats;
  const style = getCardStyle(percentage);

  return (
    <div className={`analytic-card ${style.card}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{habit.icon}</span>
          <span className="text-xl font-bold">{habit.title}</span>
        </div>
        <button onClick={() => onEdit(habit)} className="p-2 rounded-full hover:bg-gray-700/50">
          <Edit3 size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="mb-4">
        <p className={`text-sm ${style.text} font-medium`}>
          {habit.habitType === 'develop' ? 'Done' : 'Succeeded'}{' '}
          <span className="text-white font-bold text-base">{percentage}%</span> of days this month
        </p>
        <div className={`w-full h-2 rounded-full mt-2 ${style.progressBg}`}>
          <div className={`h-2 rounded-full ${style.progressFg}`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <div className="text-gray-400">Total Days</div>
          <div className="text-lg font-semibold">{daysDone}</div>
        </div>
        <div>
          <div className="text-gray-400">Longest Streak</div>
          <div className="text-lg font-semibold">{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</div>
        </div>
      </div>

      {/* Feedback */}
      <p className="text-sm text-gray-300 italic">"{feedback}"</p>
    </div>
  );
};

export default function HabitAnalytics({ title, habits, stats, onEdit }) {
  return (
    <div className="glass-card p-4 md:p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {habits.length === 0 ? (
        <p className="text-gray-400">No habits added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map(habit => (
            <AnalyticsCard 
              key={habit._id} 
              habit={habit}
              stats={stats[habit._id]}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
