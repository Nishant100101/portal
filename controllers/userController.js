import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import Assignment from "../models/assignmentModel.js";
import User from "../models/userModel.js";

// Register a new user
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ username, password, role: "USER" });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User login
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload an assignment
export const uploadAssignment = async (req, res) => {
  const { userId: username, task, admin: adminUsername } = req.body;

  try {
    const user = await User.findOne({ username, role: "USER" });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const admin = await User.findOne({
      username: adminUsername,
      role: "ADMIN",
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const assignment = new Assignment({
      userId: user._id,
      task,
      admin: admin._id,
    });

    await assignment.save();

    res.status(201).json({
      message: "Assignment uploaded successfully",
      assignment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "ADMIN" }, "username");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
