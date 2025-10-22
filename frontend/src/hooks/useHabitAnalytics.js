import { useMemo } from 'react';

/**
 * Calculates all habit analytics based on the provided habits and entries
 * for the currently viewed month.
 */
export const useHabitAnalytics = (habits, entries, currentDate) => {
  const stats = useMemo(() => {
    // 1. --- Determine calculation range ---
    const today = new Date();
    const viewingCurrentMonth = currentDate.getFullYear() === today.getFullYear() &&
                                currentDate.getMonth() === today.getMonth();
    
    // Days to use for percentage calculation
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysSoFar = viewingCurrentMonth ? today.getDate() : daysInMonth;

    // 2. --- Initialize Stats Objects ---
    const overallStats = {
      totalCompletions: 0,
      totalPossibleDays: 0,
      bestHabit: { title: 'N/A', percentage: 0 },
      worstHabit: { title: 'N/A', percentage: 100 },
    };
    
    const perHabitStats = {};
    
    // 3. --- Loop through each habit to calculate its stats ---
    const activeHabits = habits.filter(h => !h.isDeleted);

    for (const habit of activeHabits) {
      const habitEntries = entries[habit._id] || [];
      const successDays = new Set();
      
      // Populate the success set
      for (const entry of habitEntries) {
        const isSuccess = habit.habitType === 'develop' ? entry.done : !entry.done;
        if (isSuccess) {
          // Store the day of the month
          successDays.add(new Date(entry.date).getUTCDate());
        }
      }

      // --- Calculate Stats for this habit ---
      const daysDone = successDays.size;
      const percentage = daysSoFar > 0 ? (daysDone / daysSoFar) * 100 : 0;

      // Longest Streak (within this month)
      let longestStreak = 0;
      let currentStreak = 0;
      for (let i = 1; i <= daysInMonth; i++) {
        if (successDays.has(i)) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak); // Final check

      // Qualitative Feedback
      let feedback = "";
      if (percentage >= 80) feedback = "You're doing great, keep it up!";
      else if (percentage >= 50) feedback = "Good, but try to increase the frequency.";
      else feedback = "Need to focus on this habit.";

      // --- Store stats ---
      perHabitStats[habit._id] = {
        daysDone,
        percentage: Math.round(percentage),
        longestStreak,
        feedback,
      };

      // --- Update Overall Stats ---
      overallStats.totalCompletions += daysDone;
      overallStats.totalPossibleDays += daysSoFar;
      
      if (percentage > overallStats.bestHabit.percentage) {
        overallStats.bestHabit = { title: habit.title, percentage: Math.round(percentage) };
      }
      if (percentage < overallStats.worstHabit.percentage) {
        overallStats.worstHabit = { title: habit.title, percentage: Math.round(percentage) };
      }
    }
    
    // Final Overall calculation
    overallStats.overallPercentage = overallStats.totalPossibleDays > 0 
      ? Math.round((overallStats.totalCompletions / overallStats.totalPossibleDays) * 100) 
      : 0;

    return { perHabitStats, overallStats };

  }, [habits, entries, currentDate]);

  return stats;
};
