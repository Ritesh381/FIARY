import React, { useState, useRef } from "react";
import { RiSparklingLine } from "react-icons/ri";
import { Volume2, VolumeX } from "lucide-react";
import api from "../api/EntryCalls";
import { speakText, stopSpeaking } from "../config/speech";
import ReactMarkdown from "react-markdown";

export default function WeeklyInsights() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [speakingKey, setSpeakingKey] = useState(null);
  const utteranceRef = useRef(null);

  const handleGenerate = async () => {
    if (status !== "idle") return;
    setStatus("loading");
    setError(null);

    try {
      const data = await api.weeklyInsights();
      setResult(data);
      setStatus("done");
    } catch (err) {
      console.error("WeeklyInsights fetch error:", err);
      setError(err.message || "Failed to fetch weekly insights");
      setStatus("error");
    }
  };

  const renderLoading = () => (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-900/60 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-4">
      <RiSparklingLine className="w-10 h-10 animate-spin text-blue-400" />
      <p className="text-gray-300 text-lg">Generating weekly insights…</p>
    </div>
  );

  const renderResult = () => {
    if (!result) return <p className="text-gray-400">No insights returned.</p>;

    if (typeof result === "string") {
      return (
        <div className="prose prose-invert max-w-none text-gray-200">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      );
    }

    if (typeof result === "object") {
      return (
        <div className="w-full grid gap-5">
          {Object.entries(result).map(([title, body]) => (
            <div
              key={title}
              className="p-5 bg-gray-800/70 rounded-xl border border-white/10 shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <button
                  onClick={() =>
                    speakingKey === title
                      ? stopSpeaking(setSpeakingKey, utteranceRef)
                      : speakText(
                          String(body),
                          title,
                          setSpeakingKey,
                          utteranceRef
                        )
                  }
                  className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                  aria-label={`${
                    speakingKey === title ? "Stop" : "Play"
                  } reading for ${title}`}
                >
                  {speakingKey === title ? (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-green-400" />
                  )}
                </button>
              </div>
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                <ReactMarkdown>{String(body)}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <pre className="whitespace-pre-wrap text-gray-300">
        {String(result)}
      </pre>
    );
  };

  const renderError = () => (
    <div className="w-full max-w-2xl mx-auto p-6 bg-red-900/60 rounded-2xl shadow-lg flex flex-col items-center space-y-3">
      <p className="text-white font-semibold text-lg">
        Failed to generate insights
      </p>
      <p className="text-red-200 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 sm:mt-8 px-4">
      {/* Section Heading */}
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text flex items-center gap-2">
          <RiSparklingLine className="text-blue-400 w-6 h-6 animate-pulse" />
          Weekly AI Insights
        </h2>
        <p className="text-gray-400 text-sm sm:text-base mt-2 text-center max-w-md">
          Get a personalized summary and reflection based on your week’s entries.
        </p>
      </div>

      {/* Generate Button */}
      {status === "idle" && (
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:scale-[1.03] transform transition"
            aria-label="Generate Weekly AI Insights"
          >
            Generate Weekly AI Insights
          </button>
        </div>
      )}

      {/* States */}
      {status === "loading" && <div className="mt-6">{renderLoading()}</div>}
      {status === "done" && <div className="mt-6 p-4">{renderResult()}</div>}
      {status === "error" && <div className="mt-6">{renderError()}</div>}
    </div>
  );
}
