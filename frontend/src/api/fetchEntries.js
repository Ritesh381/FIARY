import { setEntries, setStreak } from "../redux/actions";
import api from "./axios";

const fetchEntries = () => async (dispatch) => {
  try {
    const entries = await api.getAllEntries();
    dispatch(setEntries(entries));

    const sortedDates = entries
      .map((entry) => new Date(entry.date || entry.createdAt))
      .sort((a, b) => a - b);

    let currentStreak = 0;
    let maxStreak = 0;
    if (sortedDates.length > 0) {
      currentStreak = 1;
      maxStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const today = sortedDates[i];
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        const isConsecutive = sortedDates.some(
          (d) =>
            d.getFullYear() === yesterday.getFullYear() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getDate() === yesterday.getDate()
        );

        if (isConsecutive) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }

        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      }
    }
    dispatch(setStreak(maxStreak));
  } catch (error) {
    console.error("Failed to fetch entries:", error);
  }
};

export default fetchEntries;