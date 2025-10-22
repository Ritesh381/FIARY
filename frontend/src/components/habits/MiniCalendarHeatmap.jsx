import React, { useMemo } from 'react';

// Helper to get all days for the calendar grid
const getCalendarDays = (currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  // Add empty padding for days before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: null, key: `pad-${i}` });
  }
  // Add all the days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, key: `day-${i}` });
  }
  return days;
};

const MiniCalendarHeatmap = ({ habit, entries, currentDate }) => {
  const calendarDays = useMemo(() => getCalendarDays(currentDate), [currentDate]);
  
  // Create a fast-lookup map for entries
  const entriesMap = useMemo(() => {
    const map = new Map();
    for (const entry of entries) {
      const day = new Date(entry.date).getUTCDate();
      map.set(day, entry);
    }
    return map;
  }, [entries]);

  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Day headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="day-header">{day}</div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map(({ day, key }) => {
          if (!day) {
            return <div key={key} className="calendar-day day-empty"></div>;
          }

          const entry = entriesMap.get(day);
          let colorClass = 'day-empty'; // Default: no entry

          if (entry) {
            const isSuccess = habit.habitType === 'develop' ? entry.done : !entry.done;
            if (isSuccess) {
              colorClass = habit.habitType === 'develop' ? 'day-success-develop' : 'day-success-quit';
            } else {
              colorClass = 'day-fail-quit'; // Only 'quit' habits have a visual fail state
            }
          }

          return (
            <div key={key} className={`calendar-day ${colorClass}`}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendarHeatmap;
