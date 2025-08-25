import express from "express";
import { authorizeUser } from "../middlewares/auth";
import {
  createAccount,
  login,
  verifyEmail,
  resendVerificationMail,
  getSession,
  getProfile,
  updateProfile,
  updatePassword,
  updateEmail,
  resendVerificationCode,
  verifyNewEmail,
} from "../controller/auth.controller";

const authRouter = express.Router();

// Public routes (no authentication required)
authRouter.post("/register", createAccount);
authRouter.post("/resend-verification", resendVerificationMail);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/login", login);

// Protected routes (authentication required)
authRouter.get("/session", authorizeUser, getSession);
authRouter.get("/profile", authorizeUser, getProfile); // Get Profile Data
authRouter.patch("/profile", authorizeUser, updateProfile); // Update Profile Data (FirstName and Last Name)
authRouter.patch("/password", authorizeUser, updatePassword); // Change Password

// Email update routes (authentication required)
authRouter.patch("/email", authorizeUser, updateEmail);
authRouter.post("/email/resend", authorizeUser, resendVerificationCode);
authRouter.post("/email/verify", authorizeUser, verifyNewEmail);

export default authRouter;
