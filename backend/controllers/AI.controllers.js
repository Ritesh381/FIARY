const callModel = require("../config/ai");
const Entry = require("../models/Entry.models");
const dailyPrompt = `You are a mentor AI for a user tracking their daily life on a platform called FIARY. I will provide you with a JSON object containing the user's diary entry data. Your task is to analyze this data and generate a new JSON object.

The keys of this new JSON object should be meaningful, positive-sounding headings for each insight.

The values should be short strings with the actual insight.

Write in a warm, uplifting, and mentor-like tone, giving actionable advice and positive reinforcement.

Add emojis to make it engaging and feel real.

Include 1–2 playful but firm scoldings for repeated bad habits the user keeps doing (e.g., “Stop scrolling Insta or I’ll haunt you 👻📱!”).

Provide practical life-improvement tips or tricks based on the user’s data.

Keep the insights short and crisp, like daily mentor notes.

Your response should be formatted as a single JSON object only.

Do not include anything outside the JSON object.`;

const weeklyPrompt = `You are a mentor AI for a user tracking their weekly life on a platform called FIARY. I will provide you with a JSON array containing the last 7 diary entries of the user. Your task is to analyze this data and generate a new JSON object.

The keys of this new JSON object should be the names of the insights you are giving.

The values should be strings containing the actual insight.

Each insight should reflect trends, patterns, and encouragement for the entire week.

The tone must be warm, uplifting, and motivating, like a mentor who genuinely cares.

Keep it short, crisp, and clear.

Add emojis to make it feel engaging and human-like.

You must also include 1–2 fun but strict scoldings for repeated bad habits that the user keeps logging (like overusing Instagram or skipping important tasks). Be playful but firm — e.g., “Stop scrolling Insta or I’ll haunt you 👻📱!”

Suggest practical life-improving tips and tricks based on the user’s patterns.

Do not include anything outside the JSON object.`;

// DAILY
const dailyInsight = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required" });

    const entry = await Entry.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const response = await callModel(dailyPrompt + JSON.stringify(entry));
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// WEEKLY
const weeklyInsight = async (req, res) => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6); // 7 days window

    // First try: get exactly 7 consecutive entries (today + past 6 days)
    const consecutiveEntries = await Entry.find({
      date: { $gte: startDate, $lte: today },
    }).sort({ date: 1 });

    let entriesToUse = [];

    if (consecutiveEntries.length === 7) {
      entriesToUse = consecutiveEntries;
    } else {
      // Fallback: get last 7 entries within last 7 calendar days
      entriesToUse = await Entry.find({
        date: { $gte: startDate, $lte: today },
      })
        .sort({ date: -1 })
        .limit(7);

      entriesToUse = entriesToUse.reverse(); // keep oldest → newest order
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

module.exports = { dailyInsight, weeklyInsight };
