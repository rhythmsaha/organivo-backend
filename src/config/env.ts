import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 8000;
export const MONGO_URI = process.env.MONGO_URI || "";
export const JWT_SECRET = process.env.JWT_SECRET || "";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
export const NODE_ENV = process.env.NODE_ENV || "development";
