const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db.js");
const entryRouter = require("./routes/Entry.routers.js");
const aiRouter = require("./routes/AI.routes.js");
const authRouter = require("./routes/Auth.routers.js");
const userRouter = require("./routes/User.routes.js");

const PORT = 8080;
const app = express();

//connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/entry", entryRouter);
app.use("/api/ai", aiRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Start server
app.listen(PORT, () =>
  console.log(`Server is running on: http://localhost:${PORT}`)
);
