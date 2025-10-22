import React from 'react';
import { Target, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

const StatCard = ({ icon, title, value, unit = '' }) => (
  <div className="glass-card p-4 rounded-xl flex items-center gap-4">
    <div className="p-3 bg-gray-800 rounded-full">
      {icon}
    </div>
    <div>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-bold">{value}{unit}</div>
    </div>
  </div>
);

export default function OverallDashboard({ stats }) {
  if (!stats) return null;

  return (
    <div className="glass-card p-4 md:p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Monthly Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Target size={24} className="text-blue-400" />}
          title="Overall Completion"
          value={stats.overallPercentage}
          unit="%"
        />
        <StatCard 
          icon={<CheckCircle size={24} className="text-green-400" />}
          title="Total Habits Done"
          value={stats.totalCompletions}
        />
        <StatCard 
          icon={<TrendingUp size={24} className="text-green-400" />}
          title="Best Habit"
          value={stats.bestHabit.title}
        />
        <StatCard 
          icon={<TrendingDown size={24} className="text-red-400" />}
          title="Needs Focus"
          value={stats.worstHabit.title}
        />
      </div>
    </div>
  );
}
