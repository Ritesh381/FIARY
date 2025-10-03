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
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-900 bg-opacity-60 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-4">
      <RiSparklingLine className="w-12 h-12 animate-spin text-white" />
      <p className="text-gray-300 text-lg">Generating weekly insights…</p>
    </div>
  );

  const renderResult = () => {
    if (!result) {
      return <p className="text-gray-300">No insights returned.</p>;
    }

    if (typeof result === "string") {
      return <ReactMarkdown>{result}</ReactMarkdown>;
    }

    if (typeof result === "object") {
      return (
        <div className="w-full grid gap-4">
          {Object.entries(result).map(([title, body]) => (
            <div
              key={title}
              className="p-4 bg-gray-800 rounded-md shadow-inner relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold">{title}</h3>
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
              <ReactMarkdown>{String(body)}</ReactMarkdown>
            </div>
          ))}
        </div>
      );
    }

    return (
      <pre className="whitespace-pre-wrap text-gray-300">{String(result)}</pre>
    );
  };

  const renderError = () => (
    <div className="w-full max-w-2xl mx-auto p-6 bg-red-900 bg-opacity-60 rounded-2xl shadow-lg flex flex-col items-center space-y-3">
      <p className="text-white font-semibold">Failed to generate insights</p>
      <p className="text-red-200 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      {status === "idle" && (
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:scale-[1.02] transform transition"
            aria-label="Generate Weekly AI Insights"
          >
            Generate Weekly AI Insights
          </button>
        </div>
      )}
      {status === "loading" && <div className="mt-6">{renderLoading()}</div>}
      {status === "done" && <div className="mt-6 p-4">{renderResult()}</div>}
      {status === "error" && <div className="mt-6">{renderError()}</div>}
    </div>
  );
}
