import type { NextFunction, Request, Response } from "express";

import asyncHandler from "express-async-handler";
import { JWT_SECRET } from "../lib/config";
import AppError from "../utils/AppError";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const authorizeUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies["authToken"] || req.headers["authorization"]?.split(" ")[1];
    if (!token) throw new AppError("Unauthorized", 401);

    const decoded = jwt.verify(token, JWT_SECRET!);
    if (!decoded) throw new AppError("Unauthorized", 401);

    req.userId = (decoded as any).id;

    next();
  } catch (error) {
    res.cookie("authToken", null, { maxAge: 0 });
    next(new AppError("Unauthorized", 401));
  }
});
