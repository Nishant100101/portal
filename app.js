import dotenv from "dotenv";
import express from "express";
import connect from "./config/database.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

const dbUri = process.env.MONGODB_URI;
connect(dbUri);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);

// Checking server
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack); //Using stack instead of message to get the exact line of error
  res.status(500).json({ message: "OOPs! Something broke!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
