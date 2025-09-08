const Entry = require("../models/Entry.models.js");

const saveEntry = async (req, res) => {
  try {
    const {
      feeling,
      bestMoment,
      worstMoment,
      goalProgress,
      timeWastedMinutes,
      timeWastedNotes = "",
      sleepHours,
      sleepNotes = "",
      physicalActivity,
      didMasturbate = false,
      masturbationNotes = "",
      didTakeBath = false,
      diaryEntry,
      date
    } = req.body;

    if (
      !feeling ||
      !bestMoment ||
      !worstMoment ||
      !goalProgress ||
      !timeWastedMinutes ||
      !sleepHours ||
      !physicalActivity ||
      !diaryEntry
    ) {
      return res.status(401).json({
        message:
          "feeling, bestMoment, worstMoment, goalProgress, timeWastedMinutes, sleepHoues, physcialActivity, diaryEntry are required",
      });
    }

    const newEntry = {
      feeling,
      bestMoment,
      worstMoment,
      goalProgress,
      timeWastedMinutes,
      timeWastedNotes,
      sleepHours,
      sleepNotes,
      physicalActivity,
      didMasturbate,
      masturbationNotes,
      didTakeBath,
      diaryEntry,
      date
    };
    await Entry.create(newEntry);

    res
      .status(201)
      .json({ message: "Entry saved sucessfully", entry: newEntry });
  } catch (error) {
    console.error("Error saving entry:", error);
    res.status(500).json({ message: "Server error while saving entry" });
  }
};

const getAllEntries = async (req, res) => {
  try {
    const data = await Entry.find({}).sort({createdAt: -1});
    return res.status(200).json({ entries: data });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const editEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (!id || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Entry ID and update data are required" });
    }

    const updatedEntry = await Entry.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run model validators on update
    });

    if (!updatedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json({ message: "Entry updated successfully", entry: updatedEntry });
  } catch (error) {
    console.error("Error editing entry:", error);
    res.status(500).json({ message: "Server error while editing entry" });
  }
};

module.exports = { saveEntry, getAllEntries, editEntry };
