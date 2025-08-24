import mongoose from "mongoose";
import { MONGO_URI } from "./env";

let retrycount = 0;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI).then((res) => {
      console.log(`Database connected to ${res.connection.name}, on ${res.connection.host}`);
    });
  } catch (error: any) {
    console.log(error.message);
    retrycount++;
    if (retrycount <= 5) {
      setTimeout(() => connectDB, 5000);
    }
  }
};

export default connectDB;
