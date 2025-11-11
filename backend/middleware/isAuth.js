const jwt = require("jsonwebtoken");
const User = require("../models/User.models");

const FILE = "isAuth.js";

const isAuth = async (req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} by user: ${req.user?._id || req.userId || "unauthenticated"}`);
    try {
        const token = req.cookies.token;
        console.log(`[LOG] [${FILE}] [isAuth] [${req.userId || "unknown"}] Checking token presence`);
        if (!token) {
            console.log(`[LOG] [${FILE}] [isAuth] [${req.userId || "unknown"}] No token provided - returning 401`);
            return res.status(401).json({ message: "Authentication failed. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`[LOG] [${FILE}] [isAuth] [${decoded?.id || "unknown"}] Token decoded`);
        const user = await User.findById(decoded.id).select("-password");
        console.log(`[LOG] [${FILE}] [isAuth] [${decoded?.id || "unknown"}] Queried User model for id: ${decoded.id}`);

        if (!user) {
            console.log(`[LOG] [${FILE}] [isAuth] [${decoded?.id || "unknown"}] User not found - returning 404`);
            return res.status(404).json({ message: "User not found." });
        }
        req.userId = decoded.id;
        req.user = user;
        console.log(`[LOG] [${FILE}] [isAuth] [${req.userId}] Authentication successful`);
        next();

    } catch (error) {
        console.error(`[ERROR] [${FILE}] [isAuth] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Authentication failed. Invalid token." });
        }
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

module.exports = isAuth