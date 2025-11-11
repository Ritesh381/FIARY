const User = require("../models/User.models");
const bcrypt = require("bcrypt");
const generateToken = require("../config/token")
const UserShelf = require("../models/shelf/UserShelf.models")

const FILE = "Auth.controllers.js";

const saltRounds = 10;

// Validate email format
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validate password strength
const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return re.test(password);
};

const login = async (req, res) => {
    const functionName = "login";
    const { email, password } = req.body;
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Starting login with email: ${email}`);

    if (!email || !password) {
        console.log(`[LOG] [${FILE}] [${functionName}] [unknown] Missing email or password`);
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        console.log(`[LOG] [${FILE}] [${functionName}] [unknown] Querying User model for email`);
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`[LOG] [${FILE}] [${functionName}] [unknown] User not found for email`);
            // Generic error message to prevent email enumeration
            return res.status(400).json({ message: "Invalid credentials." });
        }

        console.log(`[LOG] [${FILE}] [${functionName}] [${user._id}] Comparing password`);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${user._id}] Password mismatch`);
            // Generic error message for failed authentication
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = generateToken(user._id);
        console.log(`[LOG] [${FILE}] [${functionName}] [${user._id}] Generated token`);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: "/",
        });

        console.log(`[LOG] [${FILE}] [${functionName}] [${user._id}] Responding with 200`);
        res.status(200).json({ message: "Login successful.", user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};


const register = async (req, res) => {
    const functionName = "register";
    const { name, email, password } = req.body;
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Starting registration for email: ${email}`);

    if (!name || !email || !password) {
        console.log(`[LOG] [${FILE}] [${functionName}] [unknown] Missing required fields`);
        return res.status(400).json({ message: "All fields are required." });
    }

    // Validate email format
    if (!validateEmail(email)) {
        console.log(`[LOG] [${FILE}] [${functionName}] [unknown] Invalid email format: ${email}`);
        return res.status(400).json({ message: "Please provide a valid email address." });
    }

    // Validate password strength
    if (!validatePassword(password)) {
        console.log(`[LOG] [${FILE}] [${functionName}] [unknown] Weak password provided`);
        return res.status(400).json({
            message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
        });
    }

    try {
        console.log(`[LOG] [${FILE}] [${functionName}] [unknown] Checking existing user for email`);
        let user = await User.findOne({ email });
        if (user) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${user._id}] Email already exists`);
            return res.status(409).json({ message: "Email already exists." });
        }

        console.log(`[LOG] [${FILE}] [${functionName}] [unknown] Hashing password`);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        user = new User({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();
        console.log(`[LOG] [${FILE}] [${functionName}] [${user._id}] User created`);
        await UserShelf.create({
            userId: user._id,
            shelves: [
                {
                    name: "Books",
                    type: "book",
                    schema: [
                        { key: "title", type: "text", required: true },
                        { key: "cover_image", type: "photo", required: true },
                        { key: "id", type: "text", required: true },
                        { key: "user_notes", type: "text" },
                        { key: "rating", type: "number" },
                        { key: "url", type: "url" }
                    ],
                },
                {
                    name: "Movies",
                    type: "movie",
                    schema: [
                        { key: "title", type: "text", required: true },
                        { key: "cover_image", type: "photo", required: true },
                        { key: "id", type: "text", required: true },
                        { key: "user_notes", type: "text" },
                        { key: "rating", type: "number" },
                        { key: "url", type: "url" }
                    ],
                },
            ],
        });
        console.log(`[LOG] [${FILE}] [${functionName}] [${user._id}] Created default user shelves`);


        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: "/",
        });

        console.log(`[LOG] [${FILE}] [${functionName}] [${user._id}] Responding with 201`);
        res.status(201).json({ message: "Registration successful.", user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

const logout = async (req, res) => {
    const functionName = "logout";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Logging out`);
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
    });

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Responding with 200`);
    res.status(200).json({ message: "Logout successful." });
};

const check = async (req, res) => {
    const functionName = "check";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Auth check`);
    res.status(200).json({ message: "Authenticated" })
}

module.exports = {
    login,
    register,
    logout,
    check,
};
