import React, { useCallback } from 'react';
import MoodSelector from "../MoodSelector.jsx";
import { GlassCard } from "./GlassCard.jsx";

const JournalAndMoodForm = ({ entry, handleEntryChange }) => {
    
  const handleChange = useCallback((field, value) => {
    handleEntryChange("entry", field, value);
  }, [handleEntryChange]);

  return (
    <>
      <MoodSelector
        selectedMood={entry.feelingScore}
        setSelectedMood={(value) => handleChange("feelingScore", value)}
      />

      <GlassCard className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <textarea
              rows="3"
              placeholder="Achievement of the day"
              className="w-full bg-gray-900/70 resize-none rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm md:text-base"
              value={entry.achievement}
              onChange={(e) => handleChange("achievement", e.target.value)}
            />
          </div>
          <div className="space-y-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="0"
                className="w-12 md:w-16 bg-gray-900/70 text-center rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm"
                value={entry.sleepHours}
                onChange={(e) => handleChange("sleepHours", e.target.value)}
              />
              <span className="text-xs text-gray-400">Hrs</span>
              <input
                type="text"
                placeholder="Sleep Notes"
                className="flex-grow bg-transparent focus:outline-none border-b border-gray-700 focus:border-teal-400 text-sm"
                value={entry.sleepNotes}
                onChange={(e) => handleChange("sleepNotes", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="0"
                className="w-12 md:w-16 bg-gray-900/70 text-center rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm"
                value={entry.timeWastedMinutes}
                onChange={(e) => handleChange("timeWastedMinutes", e.target.value)}
              />
              <span className="text-xs text-gray-400">Min</span>
              <input
                type="text"
                placeholder="Unutilized time Notes"
                className="flex-grow bg-transparent focus:outline-none border-b border-gray-700 focus:border-teal-400 text-sm"
                value={entry.timeWastedNotes}
                onChange={(e) => handleChange("timeWastedNotes", e.target.value)}
              />
            </div>
          </div>
        </div>
        <textarea
          rows="10"
          placeholder="Start writing your beautiful day's story...."
          className="w-full bg-gray-900/70 rounded-lg resize-none px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-700/50 text-sm md:text-base"
          value={entry.diaryEntry}
          onChange={(e) => handleChange("diaryEntry", e.target.value)}
        />
      </GlassCard>
    </>
  );
};

export default JournalAndMoodForm;