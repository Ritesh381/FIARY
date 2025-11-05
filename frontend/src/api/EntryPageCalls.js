import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getAll = async (date) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/common/all`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching entry data:", error);
    throw error;
  }
};

const isInvalid = (value) => {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
        return true;
    }
    return false;
};

const saveAll = async (entryData) => {
  try {
    const entry = entryData.entry;
    if (!entry) {
      throw new Error("Entry data is required.");
    }
    const requiredFields = [
        { key: 'date', name: 'Date' },
        { key: 'feelingScore', name: 'Mood Score' },
        { key: 'achievement', name: 'Achievement of the Day' },
        { key: 'diaryEntry', name: 'Diary Entry' },
        { key: 'sleepHours', name: 'Sleep Hours' }, 
        { key: 'timeWastedMinutes', name: 'Time Wasted Minutes' }, 
    ];

    for (const { key, name } of requiredFields) {
        const value = entry[key];
        if (isInvalid(value)) {
            throw new Error(`The '${name}' field is required.`);
        }
        if ((key === 'sleepHours' || key === 'timeWastedMinutes') && Number(value) < 0) {
             throw new Error(`The '${name}' must be a non-negative number.`);
        }
    }

    const response = await axios.post(
      `${API_BASE_URL}/common/save-entry`,
      entryData
    );
    return response.data;
  } catch (error) {
    console.error("Error saving entry:", error.message || error);
    throw error;
  }
};

const updateAll = async (entryData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/common/update-entry`,
      entryData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating entry:", error);
    throw error;
  }
};

export default {
  getAll,
  saveAll,
  updateAll,
};
