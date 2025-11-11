const callModel = require("../config/ai");
const Entry = require("../models/Entry.models");
const prompts = require("../lib/prompts");
const {
  dailyInsightFormatter,
  weeklyInsightFormatter,
  monthlyInsightFormatter,
} = require("../lib/aiHelper");

const FILE = "AI.controllers.js";

const {
  daily: dailyPrompt,
  weekly: weeklyPrompt,
  monthly: monthlyPrompt,
} = prompts;

// ---------------- DAILY INSIGHT ----------------
const dailyInsight = async (req, res) => {
  const functionName = "dailyInsight";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Starting daily insight for id=${req.params.id}`);
  try {
    const { id } = req.params;
    const userId = req.userId;
    const user = req.user;

    if (!id) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Missing id`);
      return res.status(400).json({ message: "Id is required" });
    }
    if (!userId) {
      console.log(`[LOG] [${FILE}] [${functionName}] [unknown] Unauthorized`);
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the entry by its ID and ensure it belongs to the authenticated user
    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Querying Entry by id=${id}`);
    const entry = await Entry.findOne({ _id: id, user: userId });
    if (!entry) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Entry not found id=${id}`);
      return res
        .status(404)
        .json({ message: "Entry not found or access denied" });
    }

    // ---------------- Fetch Context (Last 7 Entries) ----------------
    const currentDate = new Date(entry.date);
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 6); // past 7 days (including current)

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Querying context entries between ${startDate.toISOString()} and ${currentDate.toISOString()}`);
    const context = await Entry.find({
      user: userId,
      date: { $gte: startDate, $lte: currentDate },
    }).sort({ date: 1 });

    // ---------------- AI Call ----------------
    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Calling AI model with prompt`);
    const response = await callModel(
      dailyPrompt + dailyInsightFormatter(entry, user, context)
    );

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] AI call completed`);
    res.status(200).json(response);
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [dailyInsight] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------- WEEKLY INSIGHT ----------------
const weeklyInsight = async (req, res) => {
  const functionName = "weeklyInsight";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Starting weekly insight`);
  try {
    const userId = req.userId;
    if (!userId) {
      console.log(`[LOG] [${FILE}] [${functionName}] [unknown] Unauthorized`);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6); // last 7 days (this week)

    // Current week data
    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Querying current week entries`);
    const currentWeekEntries = await Entry.find({
      user: userId,
      date: { $gte: startDate, $lte: today },
    }).sort({ date: 1 });

    if (!currentWeekEntries.length) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] No weekly entries found`);
      return res.status(404).json({ message: "No weekly entries found" });
    }

    // ---------------- Fetch Context (Previous Week) ----------------
    const prevWeekEnd = new Date(startDate);
    prevWeekEnd.setDate(startDate.getDate() - 1);
    const prevWeekStart = new Date(prevWeekEnd);
    prevWeekStart.setDate(prevWeekEnd.getDate() - 6);

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Querying previous week entries`);
    const context = await Entry.find({
      user: userId,
      date: { $gte: prevWeekStart, $lte: prevWeekEnd },
    }).sort({ date: 1 });

    // ---------------- AI Call ----------------
    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Calling AI model`);
    const response = await callModel(
      weeklyPrompt +
        weeklyInsightFormatter(currentWeekEntries, req.user, context)
    );

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] AI call completed`);
    res.status(200).json(response);
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [weeklyInsight] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------- MONTHLY INSIGHT (UNCHANGED) ----------------
const monthlyInsight = async (req, res) => {
  const functionName = "monthlyInsight";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Starting monthly insight`);
  try {
    const userId = req.userId;
    if (!userId) {
      console.log(`[LOG] [${FILE}] [${functionName}] [unknown] Unauthorized`);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29); // last 30 days

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Querying monthly entries`);
    let entriesToUse = await Entry.find({
      user: userId,
      date: { $gte: startDate, $lte: today },
    })
      .sort({ date: -1 })
      .limit(30);

    entriesToUse = entriesToUse.reverse();

    if (!entriesToUse.length) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] No monthly entries found`);
      return res.status(404).json({ message: "No monthly entries found" });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Calling AI model`);
    const response = await callModel(
      monthlyPrompt + monthlyInsightFormatter(entriesToUse, req.user)
    );

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] AI call completed`);
    res.status(200).json(response);
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [monthlyInsight] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { dailyInsight, weeklyInsight, monthlyInsight };
