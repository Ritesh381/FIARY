import React, { useEffect, useState } from "react";
import Calendar from "./Calendar";
import { SiFireship } from "react-icons/si";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Custom Tooltip Component to show notes
const CustomTooltip = ({ active, payload, label, graphDataType }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const value = dataPoint.value;

    // Format the value based on the data type
    let displayValue;
    if (graphDataType === "timeWasted") {
      const hours = Math.floor(value);
      const minutes = Math.round((value % 1) * 60);
      displayValue = `${hours}h ${minutes}m`;
    } else {
      // For sleep, just format to 2 decimal places
      displayValue = `${value.toFixed(2)}`;
    }

    return (
      <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-xl text-white max-w-xs">
        <p className="font-bold text-sm mb-1">{label}</p>
        <p style={{ color: payload[0].color }} className="text-sm">
          {/* Use the formatted displayValue */}
          {`${payload[0].name}: ${displayValue}`}
        </p>
        <p className="text-xs text-gray-400 mt-2 whitespace-normal">
          <span className="font-semibold">Notes:</span> {dataPoint.notes}
        </p>
      </div>
    );
  }
  return null;
};

function Hero() {
  const allEntries = useSelector((state) => state.entry.entries);
  const streak = useSelector((state) => state.streak.value);

  const [markedDates, setMarkedDates] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [stats, setStats] = useState({ avgSleep: 0, avgTimeWasted: 0 });

  // State for the new graph component
  const [graphDataType, setGraphDataType] = useState("sleep");
  const [graphTimeRange, setGraphTimeRange] = useState("week");
  const [graphData, setGraphData] = useState([]);
  const [graphAverage, setGraphAverage] = useState(0);

  // Effect for the Stats Card
  useEffect(() => {
    if (allEntries.length > 0) {
      const allDates = allEntries.map(
        (entry) => new Date(entry.date || entry.createdAt)
      );
      setMarkedDates(allDates);

      const now = new Date();
      const startDate = new Date();
      if (timeRange !== "all") {
        switch (timeRange) {
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case "month":
            startDate.setDate(now.getDate() - 30);
            break;
          case "week":
          default:
            startDate.setDate(now.getDate() - 7);
            break;
        }
      }

      const filtered =
        timeRange === "all"
          ? allEntries
          : allEntries.filter(
              (e) => new Date(e.date || e.createdAt) >= startDate
            );

      if (filtered.length > 0) {
        const totalSleep = filtered.reduce((sum, e) => sum + e.sleepHours, 0);
        const totalTimeWasted = filtered.reduce(
          (sum, e) => sum + e.timeWastedMinutes,
          0
        );
        setStats({
          avgSleep: totalSleep / filtered.length,
          avgTimeWasted: totalTimeWasted / filtered.length,
        });
      } else {
        setStats({ avgSleep: 0, avgTimeWasted: 0 });
      }
    }
  }, [allEntries, timeRange]);

  // Effect for the Graph Card
  useEffect(() => {
    if (allEntries.length > 0) {
      const now = new Date();
      const startDate = new Date();
      if (graphTimeRange !== "all") {
        switch (graphTimeRange) {
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case "month":
            startDate.setDate(now.getDate() - 30);
            break;
          case "week":
          default:
            startDate.setDate(now.getDate() - 7);
            break;
        }
      }

      const filtered =
        graphTimeRange === "all"
          ? allEntries
          : allEntries.filter(
              (e) => new Date(e.date || e.createdAt) >= startDate
            );

      if (filtered.length > 0) {
        const isSleep = graphDataType === "sleep";
        const dataKey = isSleep ? "sleepHours" : "timeWastedMinutes";
        const notesKey = isSleep ? "sleepNotes" : "timeWastedNotes";

        const formattedData = filtered.map((entry) => ({
          date: new Date(entry.date || entry.createdAt).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
          ),
          value: isSleep ? entry[dataKey] : entry[dataKey] / 60, // Convert mins to hours
          notes: entry[notesKey] || "No notes available.", // Include notes
        }));

        const totalValue = formattedData.reduce((sum, d) => sum + d.value, 0);
        setGraphData(formattedData);
        setGraphAverage(totalValue / formattedData.length);
      } else {
        setGraphData([]);
        setGraphAverage(0);
      }
    }
  }, [allEntries, graphDataType, graphTimeRange]);

  const avgTimeHours = Math.floor(stats.avgTimeWasted / 60);
  const avgTimeMinutes = Math.round(stats.avgTimeWasted % 60);

  // Create formatted display for graph average
  let displayGraphAverage;
  if (graphDataType === "timeWasted") {
    const hours = Math.floor(graphAverage);
    const minutes = Math.round((graphAverage % 1) * 60);
    displayGraphAverage = `${hours}h ${minutes}m`;
  } else {
    displayGraphAverage = `${graphAverage.toFixed(2)} hrs`;
  }

  return (
    <div className="flex flex-col lg:flex-row justify-center items-start gap-8 w-full p-4">
      {/* Calendar and Streak Container */}
      <div className="flex-shrink-0 relative">
        <Calendar markedDates={markedDates} />
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2 text-orange-500 text-2xl">
          <SiFireship />
          <span className="font-extrabold">{streak}</span>
        </div>
      </div>

      {/* Stats Card */}
      <div className="w-full max-w-sm bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
          <h2 className="text-xl font-bold text-white">Stats</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Average Sleep</span>
            <span className="font-semibold text-cyan-400 bg-cyan-900/50 px-3 py-1 rounded-full">
              {stats.avgSleep.toFixed(2)} hours
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Avg Fun Time</span>
            <span className="font-semibold text-amber-400 bg-amber-900/50 px-3 py-1 rounded-full">
              {avgTimeHours}h {avgTimeMinutes}m
            </span>
          </div>
        </div>
      </div>

      {/* New Graph Card */}
      <div className="w-full max-w-lg bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
          <select
            value={graphDataType}
            onChange={(e) => setGraphDataType(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2"
          >
            <option value="sleep">Sleep</option>
            <option value="timeWasted">Time Not Utilized</option>
          </select>
          <div className="text-center">
            <span className="text-gray-400 text-sm">Average</span>
            <p className="font-bold text-white text-lg">
              {displayGraphAverage}
            </p>
          </div>
          <select
            value={graphTimeRange}
            onChange={(e) => setGraphTimeRange(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={graphData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} />
              <YAxis stroke="#A0AEC0" fontSize={12} />
              <Tooltip
                content={<CustomTooltip graphDataType={graphDataType} />}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={
                  graphDataType === "sleep" ? "Sleep (hrs)" : "Time Not Utilized (hrs)"
                }
                stroke={graphDataType === "sleep" ? "#38B2AC" : "#F6E05E"}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Hero;

