import mongoose from "mongoose";

const connect = async (uri, options = {}) => {
  try {
    await mongoose.connect(uri, {
      ...options,
    });
    console.log("Database connection successful");
  } catch (error) {
    // If connection fails, log the error message and terminate the process to avoid running without a database connection
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with status 1 indicating failure
  }

  // Handle termination signals (e.g., Ctrl + C or process kill signals)
  process.on("SIGINT", async () => {
    // Close the MongoDB connection gracefully when the application is being terminated
    await mongoose.connection.close();
    process.exit(0); // Exit the process with a success status
  });
};

export default connect;
