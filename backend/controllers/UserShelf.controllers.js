// controllers/shelfController.js
const UserShelf = require("../models/shelf/UserShelf.models");
const mongoose = require("mongoose");

const createShelf = async (req, res) => {
    try {
        const { name, schema } = req.body;
        const userId = req.user._id

        if (!userId || !name)
            return res.status(400).json({ message: "name is required" });

        const userShelf = await UserShelf.findOne({ userId });
        if (!userShelf) return res.status(404).json({ message: "UserShelf not found" });

        // Prevent duplicates
        const exists = userShelf.shelves.find(
            (s) => s.name.toLowerCase() === name.toLowerCase()
        );
        if (exists)
            return res.status(400).json({ message: "Shelf with same name already exists" });

        // Create shelf
        userShelf.shelves.push({
            name,
            type: "custom",
            schema: schema || [],
        });

        await userShelf.save();
        res.status(201).json({ message: "Shelf created", shelves: userShelf.shelves });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const updateShelf = async (req, res) => {
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
        res.json({ message: "Shelf updated", shelf });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const deleteShelf = async (req, res) => {
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

        res.json({
            message: "Shelf and its items deleted successfully",
            deletedItems: deleteResult.deletedCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getShelves = async (req, res) => {
    try {
        const { userId } = req.params;
        const shelves = await UserShelf.findOne({ userId }, { shelves: 1, _id: 0 });
        if (!shelves) return res.status(404).json({ message: "No shelves found" });
        res.json(shelves);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


module.exports = {
    createShelf, updateShelf, deleteShelf, getShelves
}