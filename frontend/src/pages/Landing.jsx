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
  Smile, // Added Smile icon for Hobie Tracker
} from "lucide-react";

// --- Hero Canvas Background Component ---
const HeroCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId;

    const resizeCanvas = () => {
      // Ensure parent is available for offsetWidth/Height
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }
    };

    // Use a small delay to ensure parentElement is rendered
    const timeoutId = setTimeout(() => {
        resizeCanvas();
    }, 10);
    
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }

      update() {
        // Wall collision
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
          this.velocity.x = -this.velocity.x;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
          this.velocity.y = -this.velocity.y;
        }
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      if (canvas.width === 0) return; // Don't init if canvas has no size
      const particleCount = 50;
      // Using colors that work on a dark/transparent background
      const lightColor = "rgba(45, 212, 191, 0.5)"; // teal-400
      const darkColor = "rgba(99, 102, 241, 0.5)"; // indigo-500

      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 2 + 1;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        const color = Math.random() > 0.5 ? lightColor : darkColor;
        const velocity = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
        };
        particles.push(new Particle(x, y, radius, color, velocity));
      }
    };

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const distance =
            (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
            (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y);

          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            opacityValue = 1 - distance / 20000;
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacityValue})`; // violet-500
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => particle.update());
      connect();
    };

    if (canvas.width > 0) {
      init();
      animate();
    } else {
      // If canvas wasn't ready, try again
      setTimeout(() => {
        resizeCanvas();
        if (canvas.width > 0) {
          init();
          animate();
        }
      }, 200);
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-20"
    />
  );
};

// --- Main Page Component ---
export default function App() {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Removed theme state and useEffect

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
      name: "AI-Powered Journal",
      description:
        "Our AI analyzes your mood, sleep, and reflections to generate daily, weekly, and monthly insights. Understand your patterns, find your triggers, and build a better you.",
      icon: <BrainCircuit className="w-6 h-6" />,
      visual: (
        <img
          src="https://placehold.co/600x400/111827/4f46e5?text=AI+Insights+Mockup"
          alt="AI Insights Mockup"
          className="w-full h-auto rounded-lg border border-white/10"
          onError={(e) => (e.target.src = "https://placehold.co/600x400/111827/4f46e5?text=Image+Error")}
        />
      ),
    },
    {
      name: "Effortless Habit Tracking",
      description:
        "Log the habits that matter. Our simple, beautiful tracker helps you build streaks and visualize your progress, turning small actions into lasting change.",
      icon: <CheckCircle2 className="w-6 h-6" />,
      visual: (
        <img
          src="https://placehold.co/600x400/0f172a/14b8a6?text=Habit+Tracker+Mockup"
          alt="Habit Tracker Mockup"
          className="w-full h-auto rounded-lg border border-white/10"
          onError={(e) => (e.target.src = "https://placehold.co/600x400/0f172a/14b8a6?text=Image+Error")}
        />
      ),
    },
  ];

  // Added "Hobie Tracker" to the roadmap
  const roadmapFeatures = [
    { name: "Todo Lists", icon: <CheckCircle2 className="w-6 h-6" /> },
    { name: "Finance Tracker", icon: <Wallet className="w-6 h-6" /> },
    { name: "Hobie Tracker", icon: <Smile className="w-6 h-6" /> },
    { name: "The Shelf (Books/Movies)", icon: <Book className="w-6 h-6" /> },
    { name: "Thoughts & Memories", icon: <Lightbulb className="w-6 h-6" /> },
  ];

  const testimonials = [
    {
      quote:
        "The AI insights are scary good. It connected my bad sleep to my 'Time Wasted' entries, which was a real wake-up call.",
      name: "Rohan S.",
      location: "Bengaluru",
    },
    {
      quote:
        "I've tried 10+ habit trackers. This is the first one I've stuck with for more than a month. The interface is just so... calm.",
      name: "Priya K.",
      location: "Mumbai",
    },
  ];

  return (
    // Main wrapper is now transparent, assuming parent provides background
    <div className="bg-transparent text-gray-200 antialiased font-sans">
      {/* --- Navbar --- */}
      {/* Uses a semi-transparent dark background for the glassy effect */}
      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-600">
            FIARY
          </h1>

          {/* --- Desktop Nav --- */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="hover:text-teal-400 transition-colors">
              Features
            </a>
            <a href="#vision" className="hover:text-teal-400 transition-colors">
              Our Vision
            </a>
            <a href="#founder" className="hover:text-teal-400 transition-colors">
              Founder
            </a>
          </div>

          <div className="flex items-center space-x-2">
            {/* Theme toggle button removed */}
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
        {/* Mobile menu uses a solid dark background to be readable */}
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
                Our Vision
              </a>
              <a
                href="#founder"
                className="text-xl hover:text-teal-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Founder
              </a>
              {ctaButton("Sign Up", "mt-6")}
            </div>
          </div>
        )}
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative text-center py-20 md:py-32 container mx-auto px-4 overflow-hidden">
        <HeroCanvas />
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
            Stop guessing. <br /> Start{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-600">
              knowing.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            Fiary is more than a journal. It’s your personal AI analyst,
            turning your daily entries and habits into powerful, actionable
            insights.
          </p>
          {ctaButton("Start Your Journey")}
        </div>
      </section>

      {/* --- Features Section (What's Live) --- */}
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
              <div className="lg:w-1-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-indigo-600 text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">
                  {feature.name}
                </h3>
                <p className="text-lg text-gray-300">
                  {feature.description}
                </p>
              </div>
              {/* Visual Content */}
              <div className="lg:w-1-2 w-full">
                <GlassCard>{feature.visual}</GlassCard>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Vision/Roadmap Section --- */}
      {/* Using a subtle transparent white overlay to differentiate the section */}
      <section id="vision" className="py-24 bg-white/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            One App for Your Entire Life
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
            We're building Fiary to be the single dashboard for your
            productivity. Stop switching between apps—your life, all in one
            place.
          </p>
          <h3 className="text-2xl font-semibold mb-8 text-white">
            Coming Soon...
          </h3>
          {/* Updated grid for 5 items */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8 max-w-5xl mx-auto">
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
                  <p className="text-indigo-200">
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
              <img
                src="https://placehold.co/160x160/4338ca/ffffff?text=Your+Photo"
                alt="Founder Photo"
                className="w-40 h-40 rounded-full flex-shrink-0 border-4 border-white/20 shadow-lg"
                onError={(e) => (e.target.src = "https://placehold.co/160x160/4338ca/ffffff?text=Image+Error")}
              />
              <div>
                <h2 className="text-3xl font-bold mb-4 text-white">
                  A Note from the Founder
                </h2>
                <p className="text-lg text-gray-300 mb-4">
                  Hi, I'm [Your Name]. I built Fiary because I was tired of
                  feeling overwhelmed and using five different apps to manage
                  my life.
                </p>
                <p className="text-lg text-gray-300">
                  My vision is to create a single, beautiful tool that not
                  only organizes your life but helps you *understand* it.
                  Fiary is that tool, and we're just getting started.
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
          Start for free. No credit card required.
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

