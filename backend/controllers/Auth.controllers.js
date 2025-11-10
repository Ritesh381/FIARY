const User = require("../models/User.models");
const bcrypt = require("bcrypt");
const generateToken = require("../config/token")
const UserShelf = require("../models/shelf/UserShelf.models")

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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Generic error message to prevent email enumeration
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Generic error message for failed authentication
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: "/",
        });

        res.status(200).json({ message: "Login successful.", user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};


const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Validate email format
    if (!validateEmail(email)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
    }

    // Validate password strength
    if (!validatePassword(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
        });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({ message: "Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        user = new User({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();
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


        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: "/",
        });

        res.status(201).json({ message: "Registration successful.", user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

const logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successful." });
};

const check = async (req, res) => {
    res.status(200).json({ message: "Authenticated" })
}

module.exports = {
    login,
    register,
    logout,
    check,
};
