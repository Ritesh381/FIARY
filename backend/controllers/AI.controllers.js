const callModel = require("../config/ai");
const Entry = require("../models/Entry.models");
const {normal_prompts, special_prompts} = require("../lib/prompts");

const useSpecial = process.env.USE_SPECIAL_PROMPTS
const { daily: dailyPrompt, weekly: weeklyPrompt, monthly: monthlyPrompt } = useSpecial ? special_prompts : normal_prompts;

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

    const consecutiveEntries = await Entry.find({
      date: { $gte: startDate, $lte: today },
    }).sort({ date: 1 });

    let entriesToUse = [];

    if (consecutiveEntries.length === 7) {
      entriesToUse = consecutiveEntries;
    } else {
      entriesToUse = await Entry.find({
        date: { $gte: startDate, $lte: today },
      })
        .sort({ date: -1 })
        .limit(7);

      entriesToUse = entriesToUse.reverse();
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
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29); // last 30 days window

    let entriesToUse = await Entry.find({
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
