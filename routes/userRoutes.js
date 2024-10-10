import express from "express";
import { body } from "express-validator";
import {
  getAllAdmins,
  loginUser,
  registerUser,
  uploadAssignment,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// User registration with validation
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  registerUser
);

// User login
router.post("/login", loginUser);

// Upload an assignment (Protected route)
router.post("/upload", authMiddleware, uploadAssignment);

// Fetch all admins
router.get("/admins", authMiddleware, getAllAdmins);

export default router;
