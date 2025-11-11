const express = require("express")
const auth = require("../middleware/isAuth");
const {
    createShelf,
    updateShelf,
    deleteShelf,
    getShelves
} = require("../controllers/UserShelf.controllers")
const {
    createItem,
    updateItem,
    deleteItem,
    getItemById,
    getItemsByShelf,
    searchItems,
    searchAtTMDB,
    searctAtBooks
} = require("../controllers/ShelfItem.controllers")
const upload = require("../config/multer");

// endpoint /shelf/
const shelfRouter = express.Router()
shelfRouter.use(auth)

shelfRouter.get("/", getShelves)
shelfRouter.post("/create", createShelf)
shelfRouter.put("/update/:shelfId", updateShelf)
shelfRouter.delete("/delete/:shelfId", deleteShelf)

// endpoint /shelfitem/
const itemRouter = express.Router()
itemRouter.use(auth)

itemRouter.get("/id/:itemId", getItemById)
itemRouter.get("/shelf/:shelfId", getItemsByShelf)
itemRouter.get("/search", searchItems)
itemRouter.post("/create", upload.array("profilePic", 10), createItem)
itemRouter.put("/update/:itemId",upload.array("profilePic", 10), updateItem)
itemRouter.delete("/delete/:itemId", deleteItem)
itemRouter.get("/movie/search", searchAtTMDB)
itemRouter.get("/books/search", searctAtBooks)

module.exports = { shelfRouter, itemRouter }