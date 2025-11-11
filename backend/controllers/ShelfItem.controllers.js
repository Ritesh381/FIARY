const ShelfItem = require("../models/shelf/ShelfItem.models");
const UserShelf = require("../models/shelf/UserShelf.models");

const FILE = "ShelfItem.controllers.js";


const createItem = async (req, res) => {
    const functionName = "createItem";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Creating shelf item`);
    try {
        const userId = req.user._id;
        const { shelfId, type, title, coverImage, sourceId, sourceType, customData, userNotes, status, rating } = req.body;

        if (!shelfId || !type || !title) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Missing required fields`);
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate custom shelf data
        if (type === "custom") {
            console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Validating custom shelf schema`);
            const userShelf = await UserShelf.findOne({ userId });
            const shelf = userShelf?.shelves.id(shelfId);
            if (!shelf) {
                console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Shelf not found id=${shelfId}`);
                return res.status(404).json({ message: "Shelf not found" });
            }

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

        console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Created item id=${item._id}`);
        res.status(201).json({ message: "Item added successfully", item });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [createItem] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const updateItem = async (req, res) => {
    const functionName = "updateItem";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Updating item id=${req.params.itemId}`);
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const updates = req.body;

        const item = await ShelfItem.findOneAndUpdate(
            { _id: itemId, userId },
            updates,
            { new: true }
        );
        if (!item) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Item not found or not yours id=${itemId}`);
            return res.status(404).json({ message: "Item not found or not yours" });
        }

        console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Updated item id=${item._id}`);
        res.json({ message: "Item updated", item });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [updateItem] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const deleteItem = async (req, res) => {
    const functionName = "deleteItem";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Deleting item id=${req.params.itemId}`);
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const deleted = await ShelfItem.findOneAndDelete({ _id: itemId, userId });
        if (!deleted) return res.status(404).json({ message: "Item not found" });

        console.log(`[ACTION] [${req.user?._id || req.userId || "unknown"}] deleted shelf item ${itemId}`);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [deleteItem] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getItemById = async (req, res) => {
    const functionName = "getItemById";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Fetching item id=${req.params.itemId}`);
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const item = await ShelfItem.findOne({ _id: itemId, userId });
        if (!item) return res.status(404).json({ message: "Item not found" });
        console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Found item id=${item._id}`);
        res.json(item);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [getItemById] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getItemsByShelf = async (req, res) => {
    const functionName = "getItemsByShelf";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Fetching items for shelf id=${req.params.shelfId}`);
    try {
        const userId = req.user._id;
        const { shelfId } = req.params;
        const items = await ShelfItem.find({ userId, shelfId }).sort({ createdAt: -1 });
        console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Retrieved ${items.length} items`);
        res.json(items);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [getItemsByShelf] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const searchItems = async (req, res) => {
    const functionName = "searchItems";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Searching items q=${req.query.q}`);
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

        console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Found ${results.length} results`);
        res.json(results);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [searchItems] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    createItem, updateItem, deleteItem, getItemById, getItemsByShelf, searchItems
}