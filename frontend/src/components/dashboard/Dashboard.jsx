import React, { useState, useEffect } from "react";
import Calendar from "./Calendar";
import { SiFireship } from "react-icons/si";
import Happy from "../../assets/happy.png";
import { useSelector } from "react-redux";
import DashCal from "../DashCal";

function Dashboard() {
  const allEntries = useSelector((state) => state.entries);
  const streak = useSelector((state) => state.streak);
  const [markedDates, setMarkedDates] = useState([]);

  useEffect(() => {
    if (allEntries.length > 0) {
      const dates = allEntries.map(
        (entry) => new Date(entry.date || entry.createdAt)
      );
      setMarkedDates(dates);
    }
  }, [allEntries]);

  const getMoodData = () => {
    const moodColors = {
      Anxious: "#D32F2F", // Red
      Stressed: "#D32F2F",
      Sad: "#FFA000",
      "Ok-Ok": "#FFD700",
      Motivated: "#689F38", // Green
      Happy: "#689F38",
      Productive: "#689F38",
    };
    return allEntries.map((entry) => ({
      date: new Date(entry.date || entry.createdAt),
      color: moodColors[entry.feeling] || "#FFD700", // Default to Ok-Ok
    }));
  };

  const getBathingData = () => {
    const data = allEntries
      .filter((entry) => entry.didTakeBath)
      .map((entry) => ({
        date: new Date(entry.date || entry.createdAt),
        color: "#2196F3",
      }));
    return { dates: data.map((d) => d.date), count: data.length };
  };

  const getMasturbationData = () => {
    const data = allEntries
      .filter((entry) => entry.didMasturbate)
      .map((entry) => ({
        date: new Date(entry.date || entry.createdAt),
        color: "#E91E63",
      }));
    return { dates: data.map((d) => d.date), count: data.length };
  };

  const moodData = getMoodData();
  const bathingData = getBathingData();
  const masturbationData = getMasturbationData();

  return (
    <div className="flex flex-col items-center p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-x-12 md:space-y-0">
        <div className="flex-shrink-0">
          <Calendar markedDates={markedDates} />
        </div>
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-xl text-white font-semibold">
            You are on a roll. Keep it up
          </p>
          <div className="flex items-center space-x-2 text-orange-500 text-6xl">
            <SiFireship />
            <span className="font-extrabold">{streak}</span>
          </div>
        </div>
        <img src={Happy} alt="Happy emoji" className="h-48 md:h-64 mt-4" />
      </div>

      <div className="w-full">
        <DashCal />
      </div>

      <div className="mt-12 w-full max-w-5xl flex flex-col md:flex-row justify-between space-y-8 md:space-y-0 md:space-x-8">
        <div className="flex flex-col items-center">
          <h2 className="text-white text-lg font-semibold mb-4">
            Mood Calendar
          </h2>
          <Calendar
            markedDates={moodData.map((d) => d.date)}
            markedColor="#32CD32"
          />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-white text-lg font-semibold mb-4">
            Bathing Calendar{" "}
            <span className="ml-30 text-gray-200">{bathingData.count}</span>
          </h2>
          <Calendar markedDates={bathingData.dates} markedColor="#2196F3" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-white text-lg font-semibold mb-4">
            Masturbation Calendar{" "}
            <span className="ml-20 text-gray-200">
              {masturbationData.count}
            </span>
          </h2>
          <Calendar
            markedDates={masturbationData.dates}
            markedColor="#E91E63"
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
