import React from "react";
import { useNavigate } from "react-router-dom";

// Main App Component
export default function App() {
  const navigate = useNavigate();
  const features = [
    {
      name: "Streaks",
      description:
        "Track consecutive days of logging entries and stay motivated with visual streak progress.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-flame"
        >
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2.5-2.5-2.5S6 10.62 6 12s.5 2.5 2.5 2.5z" />
          <path d="M12.5 17.5A2.5 2.5 0 0 0 15 15c0-1.38-.5-2.5-2.5-2.5S10 13.62 10 15s.5 2.5 2.5 2.5z" />
          <path d="M16.5 10.5A2.5 2.5 0 0 0 19 8c0-1.38-.5-2.5-2.5-2.5S14 6.62 14 8s.5 2.5 2.5 2.5z" />
          <path d="M18 2l-2.5 2.5L18 7" />
          <path d="M22 2l-2.5 2.5L22 7" />
          <path d="M2 13.5l2.5-2.5L2 8" />
          <path d="M6 13.5l2.5-2.5L6 8" />
        </svg>
      ),
    },
    {
      name: "Dashboard",
      description:
        "A central hub for all your stats and insights. View trends and understand your lifestyle better.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-bar-chart-2"
        >
          <line x1="18" x2="18" y1="20" y2="10" />
          <line x1="12" x2="12" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
      ),
    },
    {
      name: "Finance Tracker",
      description:
        "Log daily expenses and categorize them. Analyze where your money goes with clear summaries.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-wallet"
        >
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h5a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
          <path d="M14 11h2v-2" />
        </svg>
      ),
    },
    {
      name: "Moments",
      description:
        "Save special memories with photos and details. Revisit them anytime to spark joy and nostalgia.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-camera"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      ),
    },
    {
      name: "Habits",
      description:
        "Add, edit, or delete habits. Track consistency and progress visually to build a better routine.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-check-circle-2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      name: "Goals",
      description:
        "Set weekly and monthly goals. Review and analyze your progress in a dedicated goals page.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-goal"
        >
          <path d="M12 10v6" />
          <path d="M15 12h-6" />
          <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      name: "Daily Entries",
      description:
        "Log your mood, wins, losses, goal progress, and more every single day for mindful reflection.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-notebook-text"
        >
          <path d="M2 6h4" />
          <path d="M2 10h4" />
          <path d="M2 14h4" />
          <path d="M2 18h4" />
          <path d="M7 2h14v20H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <path d="M10 8h6" />
          <path d="M10 12h6" />
          <path d="M10 16h6" />
        </svg>
      ),
    },
    {
      name: "Repetitive Activities",
      description:
        'Plan recurring tasks like "Do 2 LeetCode questions daily" to build discipline through structured repetition.',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-repeat-2"
        >
          <path d="M2 9h10a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H6" />
          <path d="m3 12 3 3L3 18" />
          <path d="M22 15h-9a5 5 0 0 1-5-5v0a5 5 0 0 1 5-5h4" />
          <path d="m21 12-3-3 3-3" />
        </svg>
      ),
    },
  ];

  const dailyLogItems = [
    { title: "Mood", emoji: "🙂" },
    { title: "Win of the Day", emoji: "🏆" },
    { title: "Lose of the Day", emoji: "😔" },
    { title: "Goal Progress", emoji: "📈" },
    { title: "Time Wasted", emoji: "⏱️" },
    { title: "Sleep", emoji: "💤" },
    { title: "Physical Activity", emoji: "🏃" },
    { title: "Did you take a bath?", emoji: "🚿" },
    { title: "Did you masturbate?", emoji: "💦" },
    { title: "Full Diary Entry", emoji: "📝" },
  ];

  return (
    <div className="bg-transparent text-gray-200 antialiased font-sans">
      <style>{`
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-24">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600 mb-4">
            FIARY
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Your digital diary + productivity dashboard – a single place to
            record your habits, track goals, and reflect on your daily life.
          </p>
          <a
            onClick={() => navigate("/signup")}
            className="inline-block bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            Start Your Journey
          </a>
        </section>

        {/* Features Section */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Core Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200 transition-transform transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500 text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  {feature.name}
                </h3>
                <p className="text-gray-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Entries Section */}
        <section className="mb-24">
          <div className="flex flex-col lg:flex-row items-center justify-between bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Daily Entries
              </h2>
              <p className="text-gray-300 mb-6">
                Every day, you can log a wide range of activities and
                reflections to create a holistic view of your life.
              </p>
              <ul className="grid grid-cols-2 gap-4 text-gray-200">
                {dailyLogItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 text-lg"
                  >
                    <span>{item.emoji}</span>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 flex items-center justify-center">
              {/* This is where you might place an image or graphic */}
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-300 rounded-3xl animate-pulse flex items-center justify-center text-gray-500 font-bold"></div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Vision</h2>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto mb-8">
            FIARY isn’t just a diary – it’s a life dashboard. It's built to help
            you stay consistent with habits, understand where your time and
            money go, celebrate your wins, learn from your losses, and reflect
            on life with meaningful insights. Our mission is to empower you to
            live a more mindful and productive life, one entry at a time.
          </p>
          <a
            onClick={() => navigate("/signup")}
            className="inline-block bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            Get Started
          </a>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} FIARY. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
