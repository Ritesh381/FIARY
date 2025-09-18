const User = require("../models/User.models");
const bcrypt = require("bcrypt");
const generateToken = require("../config/token")

const saltRounds = 10;

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });

        res.status(200).json({ message: "Login successful.", user: { _id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};


const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        let user = await User.findOne({ $or: [{ email }] });
        if (user) {
            return res.status(409).json({ message: "Username or email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        user = new User({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });

        res.status(201).json({ message: "Registration successful.", user: { _id: user._id, name: user.name, email: user.email } });
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

const check = async (req,res) => {
    res.status(200).json({message: "Authenticated"})
}

module.exports = {
    login,
    register,
    logout,
    check,
};