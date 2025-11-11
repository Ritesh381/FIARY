// controllers/shelfController.js
const UserShelf = require("../models/shelf/UserShelf.models");
const mongoose = require("mongoose");
const ShelfItem = require("../models/shelf/ShelfItem.models");

const FILE = "UserShelf.controllers.js";

const createShelf = async (req, res) => {
    const functionName = "createShelf";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Creating shelf`);
    try {
        const { name, schema } = req.body;
        const userId = req.user._id

        if (!userId || !name) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Missing name`);
            return res.status(400).json({ message: "name is required" });
        }

        const userShelf = await UserShelf.findOne({ userId });
        if (!userShelf) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] UserShelf not found`);
            return res.status(404).json({ message: "UserShelf not found" });
        }

        // Prevent duplicates
        const exists = userShelf.shelves.find(
            (s) => s.name.toLowerCase() === name.toLowerCase()
        );
        if (exists) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Duplicate shelf name=${name}`);
            return res.status(400).json({ message: "Shelf with same name already exists" });
        }

        // Create shelf
        userShelf.shelves.push({
            name,
            type: "custom",
            schema: schema || [],
        });

        await userShelf.save();
        console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Created shelf name=${name}`);
        res.status(201).json({ message: "Shelf created", shelves: userShelf.shelves });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [createShelf] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const updateShelf = async (req, res) => {
    const functionName = "updateShelf";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Updating shelf id=${req.params.shelfId}`);
    try {
        const { shelfId } = req.params;
        const { name, schema } = req.body;
        const userId = req.user._id

        const userShelf = await UserShelf.findOne({ userId });
        if (!userShelf) return res.status(404).json({ message: "UserShelf not found" });

        const shelf = userShelf.shelves.id(shelfId);
        if (!shelf) return res.status(404).json({ message: "Shelf not found" });
        if (shelf.type !== "custom")
            return res.status(400).json({ message: "Default shelves cannot be modified" });

        if (name) shelf.name = name;
        if (schema) shelf.schema = schema;

        await userShelf.save();
        console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Updated shelf id=${shelfId}`);
        res.json({ message: "Shelf updated", shelf });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [updateShelf] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const deleteShelf = async (req, res) => {
    const functionName = "deleteShelf";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Deleting shelf id=${req.params.shelfId}`);
    try {
        const userId = req.user._id;
        const { shelfId } = req.params;

        // Step 1: Find user shelf doc
        const userShelf = await UserShelf.findOne({ userId });
        if (!userShelf) return res.status(404).json({ message: "UserShelf not found" });

        const shelf = userShelf.shelves.id(shelfId);
        if (!shelf) return res.status(404).json({ message: "Shelf not found" });

        // Step 2: Prevent deletion of default shelves
        if (shelf.type !== "custom")
            return res
                .status(400)
                .json({ message: "Default shelves (Books/Movies) cannot be deleted" });

        // Step 3: Remove shelf from the array
        shelf.deleteOne();
        await userShelf.save();

        // Step 4: Cascade delete all shelf items linked to it
        const deleteResult = await ShelfItem.deleteMany({ userId, shelfId });
        console.log(`[ACTION] [${req.user?._id || req.userId || "unknown"}] deleted shelf ${shelfId} and ${deleteResult.deletedCount} items`);

        res.json({
            message: "Shelf and its items deleted successfully",
            deletedItems: deleteResult.deletedCount,
        });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [deleteShelf] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getShelves = async (req, res) => {
    const functionName = "getShelves";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Getting shelves for user id=${req.params.userId}`);
    try {
        const { userId } = req.params;
        const shelves = await UserShelf.findOne({ userId }, { shelves: 1, _id: 0 });
        if (!shelves) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] No shelves found for user id=${userId}`);
            return res.status(404).json({ message: "No shelves found" });
        }
        console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Returning shelves`);
        res.json(shelves);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [getShelves] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


module.exports = {
    createShelf, updateShelf, deleteShelf, getShelves
}