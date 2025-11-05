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

const saveAll = async (entryData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/common/save-entry`,
      entryData
    );
    return response.data;
  } catch (error) {
    console.error("Error saving entry:", error);
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
