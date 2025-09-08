const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db.js");
const entryRouter = require("./routes/Entry.routers.js");

const PORT = 8080;
const app = express();

//connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Routes
app.use("/api/entry", entryRouter);

// Start server
app.listen(PORT, () =>
  console.log(`Server is running on: http://localhost:${PORT}`)
);
