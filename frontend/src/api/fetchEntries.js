import api from "./apiClient";
import { setEntries } from "../redux/slices/entrySlice";
import { setStreak, setMessage } from "../redux/slices/streakSlice";

const fetchEntries = () => async (dispatch) => {
  try {
    const response = await api.get("/entry");
    const entries = response.data.entries;
    dispatch(setEntries(entries));

    if (entries.length === 0) {
      dispatch(setStreak(0));
      dispatch(
        setMessage(
          'Log your <span class="font-bold text-green-400">first entry</span> to start a streak!'
        )
      );
      return;
    }

    const sortedDates = entries
      .map((entry) => new Date(entry.date || entry.createdAt))
      .sort((a, b) => a - b);

    const normalizeDate = (date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const oneDayInMs = 1000 * 60 * 60 * 24;
    const twoDaysInMs = oneDayInMs * 2;

    let currentActiveStreak = 1;
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const lastDate = normalizeDate(sortedDates[i]);
      const prevDate = normalizeDate(sortedDates[i - 1]);
      const diff = lastDate.getTime() - prevDate.getTime();
      if (diff === oneDayInMs) currentActiveStreak++;
      else break;
    }

    const today = normalizeDate(new Date());
    const lastEntryDate = normalizeDate(sortedDates[sortedDates.length - 1]);
    const diffFromToday = today.getTime() - lastEntryDate.getTime();

    if (diffFromToday <= oneDayInMs) {
      dispatch(setStreak(currentActiveStreak));
      dispatch(
        setMessage(
          `You're on a roll with a <span class="font-bold text-orange-400">${currentActiveStreak}-day</span> streak!`
        )
      );
    } else if (diffFromToday === twoDaysInMs) {
      dispatch(setStreak(currentActiveStreak));
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
