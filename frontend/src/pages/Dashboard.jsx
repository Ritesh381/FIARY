import Calendar from "../components/Calendar";
import { useSelector, useDispatch } from "react-redux";
import DescriptiveCal from "../components/DescriptiveCal";
import Hero from "../components/Hero";
import WeeklyInsights from "../components/WeeklyInsights";

function Dashboard() {
  const allEntries = useSelector((state) => state.entry.entries);

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
      <Hero />

      <div className="w-full">
        <DescriptiveCal />
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
            Bathing Calendar {" "}
            <span className="ml-30 text-gray-200">{bathingData.count}</span>
          </h2>
          <Calendar markedDates={bathingData.dates} markedColor="#2196F3" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-white text-lg font-semibold mb-4">
            Pleasure Calendar {" "}
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

      <div className="flex flex-col items-center space-y-4 w-full max-w-3xl mb-20">
        <WeeklyInsights />
      </div>
    </div>
  );
}

export default Dashboard;