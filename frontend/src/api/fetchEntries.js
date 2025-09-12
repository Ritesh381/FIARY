import api from "./axios";
import { setEntries } from "../redux/slices/entrySlice";
import { setStreak } from "../redux/slices/streakSlice";

const fetchEntries = () => async (dispatch) => {
  try {
    const entries = await api.getAllEntries();
    dispatch(setEntries(entries));

    // Map and sort the dates just once.
    const sortedDates = entries
      .map((entry) => new Date(entry.date || entry.createdAt))
      .sort((a, b) => a - b);

    let currentStreak = 0;
    let maxStreak = 0;
    
    // Check for a single entry to start the streak
    if (sortedDates.length > 0) {
      currentStreak = 1;
      maxStreak = 1;

      // Iterate through the sorted dates to check for consecutive days
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i - 1];
        const currDate = sortedDates[i];
        
        // Normalize dates to the start of the day to avoid time-of-day issues
        const prevDay = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
        const currDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
        
        // Calculate the difference in days. A difference of 24 hours means consecutive days.
        const dayDifferenceInMs = currDay.getTime() - prevDay.getTime();
        const oneDayInMs = 1000 * 60 * 60 * 24;

        if (dayDifferenceInMs === oneDayInMs) {
          currentStreak++;
        } else if (dayDifferenceInMs > oneDayInMs) {
          // If there's a gap of more than one day, the streak is broken
          currentStreak = 1;
        }
        
        // Update the maximum streak
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      }
    }
    
    // Dispatch the final max streak value
    dispatch(setStreak(maxStreak));

  } catch (error) {
    console.error("Failed to fetch entries:", error);
  }
};

export default fetchEntries;