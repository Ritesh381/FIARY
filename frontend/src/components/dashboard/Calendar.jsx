import React, { useState } from "react";

const Calendar = ({
  markedDates = [],
  markedColor = "#f08214ff",
  onClick = () => {},
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const getDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);

    const days = [];
    // Add empty cells for the start of the month
    for (let i = 0; i < (firstDay + 6) % 7; i++) {
      days.push(null);
    }
    // Add the days of the current month
    for (let i = 1; i <= numDays; i++) {
      days.push(i);
    }
    // Add empty cells to fill the last row
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  };

  const getMonths = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
    }));
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const handleMonthChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value, 10));
    setCurrentDate(newDate);
  };

  const handleYearChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(e.target.value, 10));
    setCurrentDate(newDate);
  };

  const isMarked = (day) => {
    if (!day) return false;
    const dateToCheck = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return (markedDates.some(markedDate => {
      const d = new Date(markedDate);
      return d.getFullYear() === dateToCheck.getFullYear() && d.getMonth() === dateToCheck.getMonth() && d.getDate() === dateToCheck.getDate();
    }))
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-xl font-sans">
      {/* Month and Year Selectors */}
      <div className="flex justify-between items-center mb-4">
        <select
          value={currentDate.getMonth()}
          onChange={handleMonthChange}
          className="bg-gray-800 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {getMonths().map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
        <select
          value={currentDate.getFullYear()}
          onChange={handleYearChange}
          className="bg-gray-800 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {getYears().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 text-center text-gray-400 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="font-semibold text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {getDays().map((day, index) => (
          <div
            key={index}
            className={`
              w-10 h-10 flex items-center justify-center rounded-full text-lg cursor-pointer
              transition-all duration-200
              ${day
                ? `hover:bg-gray-700`
                : ``}
              ${isMarked(day) ? "text-white" : "text-gray-300"}
              ${day ? "" : "pointer-events-none"}
            `}
            style={isMarked(day) ? { backgroundColor: markedColor, opacity: 0.8 } : {}}
            onClick={() => day && onClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
