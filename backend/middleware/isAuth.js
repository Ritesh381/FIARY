const jwt = require("jsonwebtoken");
const User = require("../models/User.models");

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Authentication failed. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        req.userId = decoded.id;
        req.user = user;
        next();

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Authentication failed. Invalid token." });
        }
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

module.exports = isAuth