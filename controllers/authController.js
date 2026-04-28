import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { hashedPassword, comparePassword } from "../utils/hashing.js";

export const register = async(req, res) => {
    const {username, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
                error: "Username is already taken"
            });
        };
        const hashedPass = await hashedPassword(password);
        const newUser = new User({
            username,
            password: hashedPass,
            role,
        });

        await newUser.save();
        res.status(201).json({
            success: true,
            message: `User registered successfully with username: ${username}`,
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role,
            },
        });        
    } catch (err) {
        console.log("Error in register controller:", err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
}

export const login = async(req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found with username: ${username}`,
                error: "Invalid username or password"
            });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: `Invalid credentials for user: ${username}`,
                error: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.cookie("token", token, {
            httpOnly: true, //prevents client-side JavaScript from reading the cookie
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        }
        );

        res.status(200).json({
            success: true,
            message: `Login successful for user: ${username}`,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Error in login controller:", err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
};


