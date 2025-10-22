import Calendar from "../components/Calendar";
import { useSelector, useDispatch } from "react-redux";
import DescriptiveCal from "../components/DescriptiveCal";
import Hero from "../components/Hero";
import WeeklyInsights from "../components/WeeklyInsights";
import MonthlyAIInsights from "../components/MonthlyAIInsights";

function Dashboard() {
  const allEntries = useSelector((state) => state.entry.entries);

  return (
    <div className="flex flex-col items-center p-8 space-y-8">
      <Hero />

      <div className="w-full">
        <DescriptiveCal />
      </div>

      <div className="flex flex-col items-center space-y-4 w-full max-w-3xl mb-20">
        <WeeklyInsights />
        <MonthlyAIInsights/>
      </div>
    </div>
  );
}

export default Dashboard;