import express from "express";
import { body } from "express-validator";
import {
  acceptAssignment,
  getAssignmentsForAdmin,
  loginAdmin,
  registerAdmin,
  rejectAssignment,
} from "../controllers/adminController.js";
import { authMiddleware, roleCheck } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin registration
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
  registerAdmin
);

// Admin login
router.post("/login", loginAdmin);

// Get assignments tagged to the admin (Admin Protected Route)
router.get(
  "/assignments",
  authMiddleware,
  roleCheck("ADMIN"),
  getAssignmentsForAdmin
);

// Accept an assignment (Admin Protected Route)
router.post(
  "/assignments/:id/accept",
  authMiddleware,
  roleCheck("ADMIN"),
  acceptAssignment
);

// Reject an assignment (Admin Protected Route)
router.post(
  "/assignments/:id/reject",
  authMiddleware,
  roleCheck("ADMIN"),
  rejectAssignment
);

export default router;
