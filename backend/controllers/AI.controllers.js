const callModel = require("../config/ai");
const Entry = require("../models/Entry.models");
const prompts = require("../lib/prompts");
const {
  dailyInsightFormatter,
  weeklyInsightFormatter,
  monthlyInsightFormatter,
} = require("../lib/aiHelper");

const {
  daily: dailyPrompt,
  weekly: weeklyPrompt,
  monthly: monthlyPrompt,
} = prompts;

// ---------------- DAILY INSIGHT ----------------
const dailyInsight = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const user = req.user;

    if (!id) return res.status(400).json({ message: "Id is required" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Find the entry by its ID and ensure it belongs to the authenticated user
    const entry = await Entry.findOne({ _id: id, user: userId });
    if (!entry)
      return res
        .status(404)
        .json({ message: "Entry not found or access denied" });

    // ---------------- Fetch Context (Last 7 Entries) ----------------
    const currentDate = new Date(entry.date);
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 6); // past 7 days (including current)

    const context = await Entry.find({
      user: userId,
      date: { $gte: startDate, $lte: currentDate },
    }).sort({ date: 1 });

    // ---------------- AI Call ----------------
    const response = await callModel(
      dailyPrompt + dailyInsightFormatter(entry, user, context)
    );

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------- WEEKLY INSIGHT ----------------
const weeklyInsight = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6); // last 7 days (this week)

    // Current week data
    const currentWeekEntries = await Entry.find({
      user: userId,
      date: { $gte: startDate, $lte: today },
    }).sort({ date: 1 });

    if (!currentWeekEntries.length)
      return res.status(404).json({ message: "No weekly entries found" });

    // ---------------- Fetch Context (Previous Week) ----------------
    const prevWeekEnd = new Date(startDate);
    prevWeekEnd.setDate(startDate.getDate() - 1);
    const prevWeekStart = new Date(prevWeekEnd);
    prevWeekStart.setDate(prevWeekEnd.getDate() - 6);

    const context = await Entry.find({
      user: userId,
      date: { $gte: prevWeekStart, $lte: prevWeekEnd },
    }).sort({ date: 1 });

    // ---------------- AI Call ----------------
    const response = await callModel(
      weeklyPrompt +
        weeklyInsightFormatter(currentWeekEntries, req.user, context)
    );

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------- MONTHLY INSIGHT (UNCHANGED) ----------------
const monthlyInsight = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29); // last 30 days

    let entriesToUse = await Entry.find({
      user: userId,
      date: { $gte: startDate, $lte: today },
    })
      .sort({ date: -1 })
      .limit(30);

    entriesToUse = entriesToUse.reverse();

    if (!entriesToUse.length)
      return res.status(404).json({ message: "No monthly entries found" });

    const response = await callModel(
      monthlyPrompt + monthlyInsightFormatter(entriesToUse, req.user)
    );

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { dailyInsight, weeklyInsight, monthlyInsight };
