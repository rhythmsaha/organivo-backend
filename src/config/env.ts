import dotenv from "dotenv";
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || "development";

export const PORT = process.env.PORT || 8000;

export const MONGO_URI = process.env.MONGODB_URI || "";

export const HASH_PW_SALT = process.env.HASH_PW_SALT || "";
export const JWT_SECRET = process.env.JWT_SECRET || "MY_KEY";
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN as string) || "1d";

// EMAIL _SMTP

export const SMTP_HOST = process.env.SMTP_HOST || "";
export const SMTP_PORT = process.env.SMTP_PORT || 587;
export const SMTP_SECURE = process.env.SMTP_SECURE === "true";
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
