import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error";
import ErrorHandler from "./utils/AppError";

export const app = express();

app.use(express.json());

// Cors => Cross Origin Resource Sharing
app.use(cors());

app.get("/api/test", async (req: Request, res: Response, next: NextFunction) => {
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
