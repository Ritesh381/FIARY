import React, { useState } from 'react';

const EntryDetail = ({ entry }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(entry);

  if (!entry) {
    return (
      <div className="p-6 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg text-gray-400 text-center">
        No entry found for this date.
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedEntry(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const truncateString = (str, num) => {
    if (!str) return '';
    if (str.length > num) {
      return str.slice(0, num) + "...";
    }
    return str;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleSave = () => {
    // This is a placeholder for your save logic.
    // You can use the editedEntry state here to make an API call.
    console.log("Saving changes:", editedEntry);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEntry(entry);
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-gray-900 bg-opacity-50 rounded-lg shadow-lg flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-blue-400">Journal Entry</h2>
      
      {isEditing ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Feeling</h3>
              <input
                type="text"
                name="feeling"
                value={editedEntry.feeling}
                onChange={handleInputChange}
                className="bg-transparent text-white w-full border-b border-gray-500 focus:outline-none"
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Best Moment</h3>
              <textarea
                name="bestMoment"
                value={editedEntry.bestMoment}
                onChange={handleInputChange}
                className="bg-transparent text-white w-full border-b border-gray-500 focus:outline-none"
                rows="3"
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Worst Moment</h3>
              <textarea
                name="worstMoment"
                value={editedEntry.worstMoment}
                onChange={handleInputChange}
                className="bg-transparent text-white w-full border-b border-gray-500 focus:outline-none"
                rows="3"
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Goal Progress</h3>
              <textarea
                name="goalProgress"
                value={editedEntry.goalProgress}
                onChange={handleInputChange}
                className="bg-transparent text-white w-full border-b border-gray-500 focus:outline-none"
                rows="3"
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Time Wasted (minutes)</h3>
              <input
                type="number"
                name="timeWastedMinutes"
                value={editedEntry.timeWastedMinutes}
                onChange={handleInputChange}
                className="bg-transparent text-white w-full border-b border-gray-500 focus:outline-none"
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Sleep (hours)</h3>
              <input
                type="number"
                name="sleepHours"
                value={editedEntry.sleepHours}
                onChange={handleInputChange}
                className="bg-transparent text-white w-full border-b border-gray-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-md shadow-inner">
            <h3 className="font-bold text-gray-400">Diary Entry</h3>
            <textarea
              name="diaryEntry"
              value={editedEntry.diaryEntry}
              onChange={handleInputChange}
              className="bg-transparent text-white w-full border-b border-gray-500 focus:outline-none"
              rows="6"
            />
          </div>

          <div className="flex space-x-4 items-center">
            <label className="text-white flex items-center">
              <input
                type="checkbox"
                name="didTakeBath"
                checked={editedEntry.didTakeBath}
                onChange={handleInputChange}
                className="mr-2"
              />
              Did Take Bath
            </label>
            <label className="text-white flex items-center">
              <input
                type="checkbox"
                name="didMasturbate"
                checked={editedEntry.didMasturbate}
                onChange={handleInputChange}
                className="mr-2"
              />
              Did Masturbate
            </label>
          </div>

          <div className="flex space-x-4 justify-end">
            <button
              onClick={handleSave}
              className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all duration-300"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Feeling</h3>
              <p className="text-xl mt-1">{editedEntry.feeling}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Best Moment</h3>
              <p className="mt-1">{truncateString(editedEntry.bestMoment, 200)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Worst Moment</h3>
              <p className="mt-1">{truncateString(editedEntry.worstMoment, 200)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Goal Progress</h3>
              <p className="mt-1">{truncateString(editedEntry.goalProgress, 200)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Time Wasted</h3>
              <p className="mt-1">{formatTime(editedEntry.timeWastedMinutes)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-md shadow-inner">
              <h3 className="font-bold text-gray-400">Sleep</h3>
              <p className="mt-1">{editedEntry.sleepHours} hours</p>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-md shadow-inner">
            <h3 className="font-bold text-gray-400">Diary Entry</h3>
            <p className="text-gray-300 mt-1">{editedEntry.diaryEntry}</p>
          </div>
          
          <div className="flex space-x-4">
            <div className={`p-2 rounded-md ${editedEntry.didTakeBath ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <span className="text-white">{editedEntry.didTakeBath ? "Took a Bath" : "Didn't take a Bath"}</span>
            </div>
            <div className={`p-2 rounded-md ${editedEntry.didMasturbate ? 'bg-red-600' : 'bg-gray-700'}`}>
              <span className="text-white">{editedEntry.didMasturbate ? "Masturbated" : "Didn't Masturbate"}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsEditing(true)}
            className="mt-4 py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
};

export default EntryDetail;
