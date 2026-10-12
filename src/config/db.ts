import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoUri =
    process.env.MONGO_URL ||
    process.env.MONGO_URL_PROD ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("Error: MongoDB connection string missing in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Central Logging Service: MongoDB connected successfully");
  } catch (err: any) {
    console.error("Central Logging Service: MongoDB initial connection failed:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("error", (err: any) => {
    console.error("Central Logging Service: MongoDB runtime error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("Central Logging Service: MongoDB disconnected");
  });
};

export default connectDB;
