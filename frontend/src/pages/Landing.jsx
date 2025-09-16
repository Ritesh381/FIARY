// LandingPage.jsx
import React from "react";

const features = [
  {
    title: "Smart Journaling",
    desc: "Track your mood, sleep, daily wins, and time usage with a beautiful, interactive dashboard.",
  },
  {
    title: "Insightful Stats",
    desc: "See graphs of your sleep, time wasted, and mood at a glance. Build healthy streaks easily.",
  },
  {
    title: "Personal Diary",
    desc: "Write diary entries, log best and worst moments, and never miss a day of reflection.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#131313] to-[#212A2F] flex flex-col items-center justify-between pt-16 pb-16 relative">
      {/* Header/Nav */}
      <nav className="w-full flex justify-between items-center px-8 py-4 bg-transparent absolute top-0 left-0 z-10">
        <div className="text-2xl font-bold text-white tracking-tight">FIARY</div>
        <div>
          <a
            href="#features"
            className="text-white hover:text-purple-400 transition mr-8"
          >
            Features
          </a>
          <a
            href="#download"
            className="px-4 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-500 transition"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center mt-24 mb-12">
        <div className="text-5xl font-extrabold text-white text-center mb-4">
          Your <span className="text-purple-400">AI-augmented</span><br />
          Digital Diary for Well-being
        </div>
        <div className="max-w-xl text-white/80 text-center text-lg mb-8">
          Log your days, track mood & sleep, and build healthy routines with stunning, privacy-first analytics powered by AI. All in one sleek dashboard.
        </div>
        <a
          id="download"
          className="px-8 py-3 rounded bg-white/10 border border-purple-400 text-purple-200 text-lg font-semibold hover:bg-purple-400 hover:text-white transition"
          href="#"
        >
          Try FIARY Now
        </a>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full flex flex-col items-center py-16 gap-14"
      >
        <div className="text-3xl font-bold text-white mb-8">Features</div>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {features.map(({ title, desc }) => (
            <div
              key={title}
              className="max-w-xs p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm shadow-lg text-left"
            >
              <div className="text-xl font-semibold text-white mb-2">{title}</div>
              <div className="text-white/75">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshot Preview */}
      <section className="w-full flex justify-center my-12">
        <div className="rounded-xl overflow-hidden border border-white/10 bg-transparent shadow-xl flex items-center justify-center">
          {/* Replace with your own screenshot path if hosting elsewhere */}
          {/* <img
            src="/fiary-ss.jpg"
            alt="Project dashboard screenshot"
            className="w-[720px] h-auto object-cover bg-transparent"
            style={{ background: "transparent" }}
          /> */}
        </div>
      </section>

      {/* Call to Action */}
      <section className="flex flex-col items-center gap-4 mt-16">
        <div className="text-2xl font-semibold text-white">
          Ready to reclaim your day?
        </div>
        <a
          className="px-6 py-2 rounded bg-purple-600 text-white font-bold hover:bg-purple-500 transition"
          href="#"
        >
          Start Your FIARY Journey
        </a>
      </section>
      {/* Footer */}
      <footer className="w-full py-6 mt-16 text-center text-white/40 text-sm bg-transparent">
        &copy; {new Date().getFullYear()} FIARY. All rights reserved.
      </footer>
    </div>
  );
}
