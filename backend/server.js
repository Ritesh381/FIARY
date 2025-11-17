const express = require("express");
const http = require("http");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db.js");
const entryRouter = require("./routes/Entry.routers.js");
const aiRouter = require("./routes/AI.routes.js");
const authRouter = require("./routes/Auth.routers.js");
const userRouter = require("./routes/User.routes.js");
const habitRouter = require("./routes/Habit.routes.js");
const financeRouter = require("./routes/Finance.routes.js");
const financeCategoryRouter = require("./routes/Finance.categories.routes.js")
const todoRoutes = require("./routes/todo.routes");
const repeatingTaskRoutes = require("./routes/repeatingTask.routes");
const thoughtRoutes = require("./routes/Thoughts.routes.js")
const commonRouter = require("./routes/Common.routes.js");
const memoryRoutes = require("./routes/Memories.routes.js");
const { shelfRouter, itemRouter } = require("./routes/Shelf.routes.js")
const setupMurfProxy = require("./config/murfWS.js");

const PORT = 8080;
const app = express();

const server = http.createServer(app);

//connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://fiary.vercel.app"],
    credentials: true,
  })
);

// Routes
app.use("/api/entry", entryRouter);
app.use("/api/ai", aiRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/habit", habitRouter);
app.use("/api/finance", financeRouter);
app.use("/api/fincat", financeCategoryRouter)
app.use("/api/todos", todoRoutes);
app.use("/api/repeating-tasks", repeatingTaskRoutes);
app.use("/api/thoughts", thoughtRoutes)
app.use("/api/common", commonRouter);
app.use("/api/memories", memoryRoutes);
app.use("/api/shelf", shelfRouter);
app.use("/api/shelfitem", itemRouter);

// WebSocket → Murf proxy
setupMurfProxy(server);

// Start server
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
