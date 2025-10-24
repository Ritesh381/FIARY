const callModel = require("../config/ai");
const Entry = require("../models/Entry.models");
const prompts = require("../lib/prompts");

const {
  daily: dailyPrompt,
  weekly: weeklyPrompt,
  monthly: monthlyPrompt,
} = prompts;

const dailyInsight = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // Get userId from request

    if (!id) return res.status(400).json({ message: "Id is required" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Find the entry by its ID and ensure it belongs to the authenticated user
    const entry = await Entry.findOne({ _id: id, user: userId });

    if (!entry)
      return res.status(404).json({ message: "Entry not found or access denied" });

    const response = await callModel(dailyPrompt + JSON.stringify(entry));
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// WEEKLY
const weeklyInsight = async (req, res) => {
  try {
    const userId = req.userId; // Get userId from request
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6); // 7 days window

    // Base query to filter by user and date range
    const baseQuery = {
      user: userId,
      date: { $gte: startDate, $lte: today },
    };

    const consecutiveEntries = await Entry.find(baseQuery).sort({ date: 1 });

    let entriesToUse = [];

    if (consecutiveEntries.length === 7) {
      entriesToUse = consecutiveEntries;
    } else {
      // If not exactly 7, get the most recent 7 entries in the window
      entriesToUse = await Entry.find(baseQuery)
        .sort({ date: -1 })
        .limit(7);

      entriesToUse = entriesToUse.reverse(); // sort oldest -> newest
    }

    if (!entriesToUse.length)
      return res.status(404).json({ message: "No weekly entries found" });

    const response = await callModel(
      weeklyPrompt + JSON.stringify(entriesToUse)
    );

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// MONTHLY
const monthlyInsight = async (req, res) => {
  try {
    const userId = req.userId; // Get userId from request
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29); // last 30 days window

    // Find the last 30 entries for this user in the window
    let entriesToUse = await Entry.find({
      user: userId, // Filter by user ID
      date: { $gte: startDate, $lte: today },
    })
      .sort({ date: -1 })
      .limit(30);

    entriesToUse = entriesToUse.reverse(); // oldest → newest order

    if (!entriesToUse.length)
      return res.status(404).json({ message: "No monthly entries found" });

    const response = await callModel(
      monthlyPrompt + JSON.stringify(entriesToUse)
    );

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { dailyInsight, weeklyInsight, monthlyInsight };