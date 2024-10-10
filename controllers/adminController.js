import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import Assignment from "../models/assignmentModel.js";
import User from "../models/userModel.js";

// Register a new admin
export const registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const existingAdmin = await User.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new User({ username, password, role: "ADMIN" });
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.status(201).json({ message: "Admin registered successfully", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Admin
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await User.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
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

// Fetch all assignments tagged to the Admin
export const getAssignmentsForAdmin = async (req, res) => {
  const adminId = req.user.id;

  try {
    const assignments = await Assignment.find({ admin: adminId })
      .populate("userId", "username")
      .select("task createdAt updatedAt userId status");

    if (assignments.length === 0) {
      return res.status(404).json({ message: "No assignments found" });
    }

    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment._id,
      userName: assignment.userId.username,
      task: assignment.task,
      status: assignment.status,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    }));

    res.status(200).json(formattedAssignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept an assignment
export const acceptAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      admin: req.user.id,
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.status = "accepted";
    await assignment.save();

    res.status(200).json({ message: "Assignment accepted", assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject an assignment
export const rejectAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      admin: req.user.id,
    });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.status = "rejected";
    await assignment.save();

    res.status(200).json({ message: "Assignment rejected", assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
