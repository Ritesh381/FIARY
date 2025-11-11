const ShelfItem = require("../models/shelf/ShelfItem.models");
const UserShelf = require("../models/shelf/UserShelf.models");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const FILE = "ShelfItem.controllers.js";

/**
 * Create a shelf item
 */
const createItem = async (req, res) => {
    const functionName = "createItem";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id}] Creating shelf item`);

    try {
        const userId = req.user._id;
        const { shelfId, type, data, status } = req.body;

        if (!shelfId || !type || !data) {
            console.log(`[LOG] [${FILE}] [${functionName}] Missing required fields`);
            return res.status(400).json({ message: "Missing required fields (shelfId, type, data)" });
        }

        // 🧩 Validate shelf and schema
        const userShelf = await UserShelf.findOne({ userId });
        if (!userShelf) {
            return res.status(404).json({ message: "User shelf data not found" });
        }

        const shelf = userShelf.shelves.id(shelfId);
        if (!shelf) {
            return res.status(404).json({ message: "Shelf not found" });
        }

        const schemaFields = shelf.schema || [];
        for (const field of schemaFields) {
            if (field.required && (data[field.key] === undefined || data[field.key] === null)) {
                return res.status(400).json({ message: `Missing required field: ${field.key}` });
            }
        }

        // 🚫 Check for duplicates for movies/books
        if (type === "book" || type === "movie") {
            if (!data.id) {
                return res.status(400).json({ message: "Missing 'id' field in data for book/movie" });
            }

            const existingItem = await ShelfItem.findOne({
                userId,
                shelfId,
                type,
                "data.id": data.id, // exact match for book/movie id
            });

            if (existingItem) {
                console.log(`[LOG] [${FILE}] [${functionName}] Duplicate entry detected for ${type} id=${data.id}`);
                return res.status(409).json({ message: `This ${type} is already in your shelf` });
            }
        }

        // ✅ Create the item
        const newItem = await ShelfItem.create({
            userId,
            shelfId,
            type,
            status: status || "in-progress",
            data,
        });

        console.log(`[LOG] [${FILE}] [${functionName}] Created item id=${newItem._id}`);
        res.status(201).json({ message: "Item added successfully", item: newItem });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [createItem]`, err.stack || err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Update a shelf item
 */
const updateItem = async (req, res) => {
    const functionName = "updateItem";
    console.log(`[LOG] [${FILE}] [${functionName}] Updating item id=${req.params.itemId}`);

    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const { data, status } = req.body;

        const updated = await ShelfItem.findOneAndUpdate(
            { _id: itemId, userId },
            { ...(data && { data }), ...(status && { status }) },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Item not found or not yours" });
        }

        console.log(`[LOG] [${FILE}] [${functionName}] Updated item id=${updated._id}`);
        res.json({ message: "Item updated", item: updated });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [updateItem]`, err.stack || err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Delete a shelf item
 */
const deleteItem = async (req, res) => {
    const functionName = "deleteItem";
    console.log(`[LOG] [${FILE}] [${functionName}] Deleting item id=${req.params.itemId}`);

    try {
        const userId = req.user._id;
        const { itemId } = req.params;

        const deleted = await ShelfItem.findOneAndDelete({ _id: itemId, userId });
        if (!deleted) return res.status(404).json({ message: "Item not found" });

        console.log(`[ACTION] [${userId}] deleted shelf item ${itemId}`);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [deleteItem]`, err.stack || err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Get single item by ID
 */
const getItemById = async (req, res) => {
    const functionName = "getItemById";
    console.log(`[LOG] [${FILE}] [${functionName}] Fetching item id=${req.params.itemId}`);

    try {
        const userId = req.user._id;
        const { itemId } = req.params;

        const item = await ShelfItem.findOne({ _id: itemId, userId });
        if (!item) return res.status(404).json({ message: "Item not found" });

        res.json(item);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [getItemById]`, err.stack || err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Get all items under a shelf
 */
const getItemsByShelf = async (req, res) => {
    const functionName = "getItemsByShelf";
    console.log(`[LOG] [${FILE}] [${functionName}] Fetching items for shelf id=${req.params.shelfId}`);

    try {
        const userId = req.user._id;
        const { shelfId } = req.params;

        const items = await ShelfItem.find({ userId, shelfId }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [getItemsByShelf]`, err.stack || err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Search user’s shelf items by query
 */
const searchItems = async (req, res) => {
    const functionName = "searchItems";
    const userId = req.user._id;
    const query = req.query.q;

    if (!query) return res.status(400).json({ message: "Search query required" });

    console.log(`[LOG] [${FILE}] [${functionName}] Searching items q=${query}`);

    try {
        const regex = new RegExp(query, "i");
        const results = await ShelfItem.find({
            userId,
            $or: [
                { "data.title": regex },
                { "data.user_notes": regex },
                { "data.description": regex },
            ],
        });

        res.json(results);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [searchItems]`, err.stack || err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Proxy to TMDB for searching movies/TV
 */
const searchAtTMDB = async (req, res) => {
    try {
        const { q, type } = req.query;

        if (!q || !type) {
            return res.status(400).json({ error: "Missing query or type parameter" });
        }

        const response = await fetch(
            `https://api.themoviedb.org/3/search/${type}?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(q)}`
        );

        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json({ result: data });
    } catch (error) {
        console.error("Error fetching from TMDB:", error.message);
        res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
};

const searctAtBooks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: "Missing query parameter" });
        }
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}`)

        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json({ result: data });
    } catch (error) {
        console.error("Error fetching from TMDB:", error.message);
        res.status(500).json({ error: "Failed to fetch from TMDB" });
    }

}

module.exports = {
    createItem,
    updateItem,
    deleteItem,
    getItemById,
    getItemsByShelf,
    searchItems,
    searchAtTMDB,
    searctAtBooks,
};
