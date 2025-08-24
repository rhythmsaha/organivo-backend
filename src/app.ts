import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error";
import ErrorHandler from "./utils/AppError";
import authRouter from "./routes/auth.route";

export const app = express();

app.use(express.json());

// Cors => Cross Origin Resource Sharing
app.use(cors());

// Routes

// Authentication routes
app.use("/api/auth", authRouter);

app.get("/api/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
    pid: process.pid,
  });
});

// Catch Unknown Routes
app.all("/{*splat}", (req: Request, res: Response, next: NextFunction) => {
  const error = new ErrorHandler(`Route not found - ${req.originalUrl}`, 404);
  next(error);
});

app.use(errorMiddleware);
