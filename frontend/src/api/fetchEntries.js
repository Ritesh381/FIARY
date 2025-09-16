import api from "../api/axios";
import { setEntries } from "../redux/slices/entrySlice";
import { setStreak, setMessage } from "../redux/slices/streakSlice";

const fetchEntries = () => async (dispatch) => {
  try {
    const entries = await api.getAllEntries();
    dispatch(setEntries(entries));

    // --- New, Improved Streak Calculation Logic ---

    if (entries.length === 0) {
      dispatch(setStreak(0));
      dispatch(
        setMessage(
          'Log your <span class="font-bold text-green-400">first entry</span> to start a streak!'
        )
      );
      return;
    }

    // 1. Prepare Dates
    const sortedDates = entries
      .map((entry) => new Date(entry.date || entry.createdAt))
      .sort((a, b) => a - b);

    const normalizeDate = (date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const oneDayInMs = 1000 * 60 * 60 * 24;
    const twoDaysInMs = oneDayInMs * 2;

    // 2. Calculate the CURRENT active streak by working backwards
    let currentActiveStreak = 1; // Start with 1 for the most recent entry
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const lastDate = normalizeDate(sortedDates[i]);
      const prevDate = normalizeDate(sortedDates[i - 1]);
      const diff = lastDate.getTime() - prevDate.getTime();

      if (diff === oneDayInMs) {
        currentActiveStreak++;
      } else {
        // The first time we find a gap, the active streak from before that point ends.
        break;
      }
    }

    // 3. Compare the most recent entry with TODAY's date to set the final streak and message
    const today = normalizeDate(new Date());
    const lastEntryDate = normalizeDate(sortedDates[sortedDates.length - 1]);
    const diffFromToday = today.getTime() - lastEntryDate.getTime();

    if (diffFromToday <= oneDayInMs) {
      // Case 1: Streak is active (logged today or yesterday)
      dispatch(setStreak(currentActiveStreak));
      dispatch(
        setMessage(
          `You're on a roll with a <span class="font-bold text-orange-400">${currentActiveStreak}-day</span> streak!`
        )
      );
    } else if (diffFromToday === twoDaysInMs) {
      // Case 2: Streak is AT RISK (missed one day)
      dispatch(setStreak(currentActiveStreak));

      // Create and format the date for the message
      const nextDay = new Date(lastEntryDate);
      nextDay.setDate(lastEntryDate.getDate() + 1);

      const month = nextDay.toLocaleString("default", { month: "short" });
      const day = nextDay.getDate();
      const year = nextDay.getFullYear();
      const formattedNextDay = `${month} ${day} ${year}`;

      dispatch(
        setMessage(
          `Log <span class="font-bold text-red-300">${formattedNextDay}</span> to continue your <span class="font-bold text-orange-400">${currentActiveStreak}-day</span> streak!`
        )
      );
    } else {
      // Case 3: Streak is BROKEN (missed more than one day)
      dispatch(setStreak(0));
      dispatch(
        setMessage(
          'You <span class="font-bold text-red-500">lost your streak</span>. Start a new one today!'
        )
      );
    }
  } catch (error) {
    console.error("Failed to fetch entries:", error);
    dispatch(setStreak(0));
    dispatch(setMessage("Could not calculate streak."));
  }
};

export default fetchEntries;

