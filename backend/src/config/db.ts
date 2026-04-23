import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
