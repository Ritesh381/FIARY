const callModel = require("../config/ai");
const Entry = require("../models/Entry.models");

const dailyPrompt = `You are a mentor AI for a user tracking their daily life on a platform called FIARY. I will provide you with a JSON object containing a user's diary entry data. Your task is to analyze this data and generate a new JSON object. The keys of this new JSON object should be the names of the insights you are giving, and the values should be a string containing the actual insight. GIve the name of the insight something good which acts as a heading for the insight. Your response should be formatted as a single JSON object. The insights should be written in a warm, encouraging, and helpful tone, like a mentor giving advice to a user. Focus on providing actionable advice and positive reinforcement. Do not include any extra text outside the JSON object. Keep the response short and crisp. Here is the user's data:`;
const weeklyPrompt = ``;

const dailyInsight = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required" });
    const entry = await Entry.findById(id);
    const response = await callModel(dailyPrompt + entry);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {dailyInsight}