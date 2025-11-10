const ShelfItem = require("../models/shelf/ShelfItem.models");
const UserShelf = require("../models/shelf/UserShelf.models");


const createItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shelfId, type, title, coverImage, sourceId, sourceType, customData, userNotes, status, rating } = req.body;

        if (!shelfId || !type || !title)
            return res.status(400).json({ message: "Missing required fields" });

        // Validate custom shelf data
        if (type === "custom") {
            const userShelf = await UserShelf.findOne({ userId });
            const shelf = userShelf?.shelves.id(shelfId);
            if (!shelf) return res.status(404).json({ message: "Shelf not found" });

            for (let field of shelf.schema || []) {
                if (field.required && !(customData && customData[field.key] !== undefined))
                    return res
                        .status(400)
                        .json({ message: `Missing required field: ${field.key}` });
            }
        }

        const item = await ShelfItem.create({
            userId,
            shelfId,
            type,
            title,
            coverImage,
            sourceId,
            sourceType,
            customData,
            userNotes,
            status,
            rating,
        });

        res.status(201).json({ message: "Item added successfully", item });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const updates = req.body;

        const item = await ShelfItem.findOneAndUpdate(
            { _id: itemId, userId },
            updates,
            { new: true }
        );
        if (!item) return res.status(404).json({ message: "Item not found or not yours" });

        res.json({ message: "Item updated", item });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const deleted = await ShelfItem.findOneAndDelete({ _id: itemId, userId });
        if (!deleted) return res.status(404).json({ message: "Item not found" });

        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getItemById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const item = await ShelfItem.findOne({ _id: itemId, userId });
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getItemsByShelf = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shelfId } = req.params;
        const items = await ShelfItem.find({ userId, shelfId }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const searchItems = async (req, res) => {
    try {
        const userId = req.user._id;
        const query = req.query.q;

        if (!query) return res.status(400).json({ message: "Search query required" });
        const regex = new RegExp(query, "i");

        const results = await ShelfItem.find({
            userId,
            $or: [
                { title: regex },
                { userNotes: regex },
                { "customData": { $regex: regex } },
            ],
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    createItem, updateItem, deleteItem, getItemById, getItemsByShelf, searchItems
}