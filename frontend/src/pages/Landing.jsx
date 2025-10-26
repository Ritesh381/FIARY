import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  CheckCircle2,
  BrainCircuit,
  Wallet,
  Book,
  Lightbulb,
  Sparkles,
  Smile,
  LineChart,
  Repeat, // Added Repeat for Tasks
  IndianRupee, // Added IndianRupee for Finance
} from "lucide-react";
import AIInsight from "../assets/AI-insight.png"; // Mock AI image
import HabitImage from "../assets/Habit-Tracker.png"; // Mock Habit image
import Founder from "../assets/founder.png"; // Founder image
// import AnalyticsGraph from "../assets/AnalyticsGraph.png" // Using a generic graph name
import FinDashboard from "../assets/FinDashboard.png"

export default function App() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const ctaButton = (text, className = "") => (
    <a
      onClick={() => navigate("/signup")}
      className={`cursor-pointer inline-block bg-gradient-to-r from-teal-400 to-indigo-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1 ${className}`}
    >
      {text}
    </a>
  );

  const GlassCard = ({ children, className = "" }) => (
    <div
      className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10 transition-transform transform hover:-translate-y-2 hover:shadow-2xl ${className}`}
    >
      {children}
    </div>
  );

  const features = [
  {
    name: "AI-Powered Journaling",
    description:
      "Powered by Gemini, AI analyzes your mood, sleep, and entries to generate personalized insights. Understand your emotional and productivity patterns and get actionable advice to build a better you.",
    icon: <BrainCircuit className="w-6 h-6" />,
    visual: (
      <img
        src={AIInsight}
        alt="AI Insights Mockup"
        className="w-full h-auto rounded-lg border border-white/10"
        onError={(e) =>
          (e.target.src =
            "https://placehold.co/600x400/111827/4f46e5?text=AI+Insights")
        }
      />
    ),
  },
  {
    name: "Effortless Habit Tracking",
    description:
      "Log the habits that matter, whether you are developing a new skill or trying to quit a bad pattern. Build streaks and visualize your commitment with clear analytics and progress heatmaps.",
    icon: <CheckCircle2 className="w-6 h-6" />,
    visual: (
      <img
        src={HabitImage}
        alt="Habit Tracker Mockup"
        className="w-full h-auto rounded-lg border border-white/10"
        onError={(e) =>
          (e.target.src =
            "https://placehold.co/600x400/0f172a/14b8a6?text=Habit+Tracker")
        }
      />
    ),
  },
  {
    name: "Integrated Tasks & Finance",
    description:
      "Manage daily priorities with one-time Todos and set up automated 'Repeating Tasks'. Log all your financial transactions (Income/Expense) directly alongside your daily journal, centralizing your entire life log.",
    icon: <Repeat className="w-6 h-6" />,
    visual: (
      <img
        src={FinDashboard}
        alt="Habit Tracker Mockup"
        className="w-full h-auto rounded-lg border border-white/10"
        onError={(e) =>
          (e.target.src =
            "https://placehold.co/600x400/0f172a/14b8a6?text=Habit+Tracker")
        }
      />
    ),
  },
];

  const roadmapFeatures = [
    { name: "Moments (Memories)", icon: <Lightbulb className="w-6 h-6" /> },
    { name: "Thoughts Vault", icon: <Smile className="w-6 h-6" /> },
    { name: "The Shelf (Media)", icon: <Book className="w-6 h-6" /> },
    { name: "Personalization (Profile/Settings)", icon: <Wallet className="w-6 h-6" /> },
  ];

  const testimonials = [
    {
      quote:
        "FIARY helped me analyze my days with the journaling feature and the AI insights are also a very good feature to analyze your time. I also loved the UI of FIARY",
      name: "Ritesh Prajapati",
      location: "Bengaluru",
    },
    {
      quote:
        "I was tired of using five different apps. FIARY is the first one I've stuck with for more than a month—the interface is just so intuitive.",
      name: "Someone",
      location: "Bengaluru",
    },
  ];

  return (
    <div className="bg-transparent text-gray-200 antialiased font-sans">
      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-600">
            FIARY
          </h1>

          {/* --- Desktop Nav --- */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="hover:text-teal-400 transition-colors"
            >
              Features
            </a>
            <a href="#vision" className="hover:text-teal-400 transition-colors">
              Roadmap
            </a>
            <a
              href="#founder"
              className="hover:text-teal-400 transition-colors"
            >
              About
            </a>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:block">{ctaButton("Sign Up")}</div>

            {/* --- Mobile Menu Button --- */}
            <button
              className="p-2 rounded-full hover:bg-gray-700 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- Mobile Menu --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-gray-900 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-600">
                FIARY
              </h1>
              <button
                className="p-2 rounded-full hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col space-y-6 text-center">
              <a
                href="#features"
                className="text-xl hover:text-teal-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#vision"
                className="text-xl hover:text-teal-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Roadmap
              </a>
              <a
                href="#founder"
                className="text-xl hover:text-teal-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              {ctaButton("Sign Up", "mt-6")}
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative text-center py-20 md:py-32 container mx-auto px-4 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
            Stop guessing. <br /> Start{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-600">
              knowing.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            Fiary is more than a journal. It’s your personal dashboard, turning
            your daily entries, habits, and finances into powerful, actionable insights.
          </p>
          {ctaButton("Start Your Journey")}
        </div>
      </section>

      {/* --- Features Section (What's Live - UPDATED) --- */}
      <section id="features" className="py-24 container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
          Your Life in High-Res
        </h2>
        <div className="space-y-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-12`}
            >
              {/* Text Content */}
              <div className="lg:w-1/2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-indigo-600 text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">
                  {feature.name}
                </h3>
                <p className="text-lg text-gray-300">{feature.description}</p>
              </div>
              {/* Visual Content */}
              <div className="lg:w-1/2 w-full">
                <GlassCard>{feature.visual}</GlassCard>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Vision/Roadmap Section (UPDATED) --- */}
      <section id="vision" className="py-24 bg-white/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            One App for Your Entire Life
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
            We're building Fiary to be the single dashboard for your productivity. Stop switching between apps—your life, all in one place.
          </p>
          <h3 className="text-2xl font-semibold mb-8 text-white">
            Next on the Roadmap
          </h3>
          {/* Updated grid for features in development */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
            {roadmapFeatures.map((feature) => (
              <GlassCard
                key={feature.name}
                className="p-4 transform-none hover:shadow-2xl"
              >
                <div className="flex flex-col items-center">
                  <div className="text-teal-400 mb-3">{feature.icon}</div>
                  <h4 className="text-md md:text-lg font-semibold text-white">
                    {feature.name}
                  </h4>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="mt-12">
            <GlassCard className="max-w-2xl mx-auto p-6 bg-indigo-500/10 border-indigo-500/20">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="text-indigo-400 flex-shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-indigo-300">
                    The Ultimate Goal: The Mirror
                  </h4>
                  <p className="text-indigo-200 text-sm">
                    Your personal AI chatbot, trained on *you*. Ask it
                    questions, get advice, and reflect like never before.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* --- Testimonials Section --- */}
      <section className="py-24 container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          What Our First Users Are Saying
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <GlassCard key={index} className="p-8 transform-none">
              <p className="text-lg font-medium text-white mb-4">
                "{testimonial.quote}"
              </p>
              <p className="font-semibold text-teal-400">
                {testimonial.name}
                <span className="text-gray-400 font-normal">
                  , {testimonial.location}
                </span>
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* --- Founder Section --- */}
      <section id="founder" className="py-24 bg-white/5">
        <div className="container mx-auto px-4">
          <GlassCard className="max-w-4xl mx-auto p-8 md:p-12 transform-none">
            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-8">
              <a
                href="https://riteshjs.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
                  <img
                    src={Founder}
                    alt="Founder Photo"
                    className="w-full h-full object-cover object-center"
                    onError={(e) =>
                      (e.target.src =
                        "https://placehold.co/160x160/4338ca/ffffff?text=Founder")
                    }
                  />
                </div>
              </a>

              <div>
                <h2 className="text-3xl font-bold mb-4 text-white">
                  A Note from the Founder
                </h2>
                <p className="text-lg text-gray-300 mb-4">
                  Hi, I'm Ritesh Prajapati. I built Fiary because I was tired of
                  feeling overwhelmed and using five different apps to manage my
                  life.
                </p>
                <p className="text-lg text-gray-300">
                  My vision is to create a single, beautiful tool that not only
                  organizes your life but helps you understand it. Fiary is that
                  tool, and we're just getting started.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* --- Final CTA Section --- */}
      <section className="text-center py-24 container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          Ready to build a more productive life?
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Start for free.
        </p>
        {ctaButton("Sign Up Now for Free")}
      </section>

      {/* --- Footer --- */}
      <footer className="text-center text-gray-400 text-sm py-8 border-t border-gray-800">
        &copy; {new Date().getFullYear()} FIARY. All rights reserved.
      </footer>
    </div>
  );
}
