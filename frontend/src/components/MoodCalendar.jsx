import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setDate } from "../redux/slices/formSlice"; // Import setDate action

const Calendar = ({
  markedDates = [], // Expects an array of objects: [{ date: "YYYY-MM-DD", feelingScore: 1-10 }]
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
    for (let i = 0; i < (firstDay + 6) % 7; i++) {
      days.push(null);
    }
    for (let i = 1; i <= numDays; i++) {
      days.push(i);
    }
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

  /**
   * Helper function to get a color based on the mood score.
   */
  const getColorForScore = (score) => {
    if (score === null || score === undefined) return null;
    const hue = ((score - 1) / 9) * 120;
    return `hsl(${hue}, 70%, 50%)`;
  };

  /**
   * Finds and returns the data for a marked date, if it exists.
   */
  const getMarkedDateData = (day) => {
    if (!day) return null;

    const dateToFormat = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const year = dateToFormat.getFullYear();
    const month = String(dateToFormat.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(dateToFormat.getDate()).padStart(2, '0');
    const dateToCheck = `${year}-${month}-${formattedDay}`;

    return markedDates.find((markedDate) => {
      const entryDate = markedDate.date.split('T')[0];
      return entryDate === dateToCheck;
    });
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-xl font-urbane">
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
        {getDays().map((day, index) => {
          const markedData = getMarkedDateData(day);
          const isMarked = !!markedData;
          const dayStyle = isMarked
            ? {
                backgroundColor: getColorForScore(markedData.feelingScore),
                opacity: 0.8,
              }
            : {};

          return (
            <div
              key={index}
              className={`
                w-10 h-10 flex items-center justify-center rounded-full text-lg cursor-pointer
                transition-all duration-200
                ${day ? `hover:bg-gray-700` : ``}
                ${isMarked ? "text-white" : "text-gray-300"}
                ${day ? "" : "pointer-events-none"}
              `}
              style={dayStyle}
              onClick={() =>
                day &&
                onClick(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  )
                )
              }
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};


const MoodCalendar = ({ onClick }) => {
  const allEntries = useSelector((state) => state.entry.entries);
  const dispatch = useDispatch();

 const handleDateClick = (date) => {
  // Use a helper function to format the date to YYYY-MM-DD
  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const formattedDate = formatDate(date);
  dispatch(setDate(formattedDate));
};

  const markedDates = allEntries.map((entry) => {
    const date = entry.date
      ? entry.date
      : new Date(entry.createdAt).toISOString().split("T")[0];
    return {
      date: date,
      feelingScore: entry.feelingScore,
    };
  });

  return <Calendar markedDates={markedDates} onClick={handleDateClick} />;
};

export default MoodCalendar;