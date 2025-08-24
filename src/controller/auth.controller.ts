import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User, { IUser, TempEmail } from "../models/User.model";
import { default as validator } from "validator";
import { mailer } from "../utils/NodeMailer";
import ErrorHandler from "../utils/AppError";

const sendVerificationCode = async (user: IUser) => {
  const code = await user.generateVerificationCode();
  const messageId = await mailer.sendVerificationEmail({
    code,
    name: `${user.firstName} ${user.lastName}`,
    to: user.email,
  });

  return messageId;
};

interface CreateAccountBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export const createAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, password } = req.body as CreateAccountBody;
  if (!firstName || !lastName || !email || !password) {
    throw new ErrorHandler("All fields are required", 400);
  }

  if (!validator.isEmail(email)) {
    throw new ErrorHandler("Invalid email", 400);
  }

  // Create user logic here

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    hashed_password: password,
  });

  if (!newUser) {
    res.status(500);
    throw new Error("User creation failed");
  }

  // const messageId = await sendVerificationCode(newUser);

  res.status(201).json({
    success: true,
    message: "Please check your email for the verification code",
    data: {
      id: newUser._id,
      email: newUser.email,
    },
  });
});

export const resendVerificationMail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!validator.isEmail(email)) {
    throw new ErrorHandler("Invalid email", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  if (user.verified) {
    throw new ErrorHandler("User is already verified", 400);
  }

  if (!user.verificationCode) {
    user.verificationCode = await user.generateVerificationCode();
    await user.save();
  }

  await mailer.sendVerificationEmail({
    code: user.verificationCode,
    name: `${user.firstName} ${user.lastName}`,
    to: user.email,
  });

  res.status(200).json({
    success: true,
    message: "Verification email resent",
    data: {
      id: user._id,
      email: user.email,
    },
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, code } = req.body;

  if (!validator.isEmail(email)) {
    throw new ErrorHandler("Invalid email", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  if (user.verified) {
    throw new ErrorHandler("User is already verified", 400);
  }

  if (user.verificationCode !== code) {
    throw new ErrorHandler("Invalid verification code", 400);
  }
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!validator.isEmail(email)) {
    throw new ErrorHandler("Invalid email", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ErrorHandler("Invalid password", 400);
  }

  const token = user.signAccessToken();
  const profile = user.getProfile();

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: profile,
    },
  });
});

export const getSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    throw new ErrorHandler("User not found", 404);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const token = user.signAccessToken();
  const profile = user.getProfile();

  // Your logic here

  res.status(200).json({
    success: true,
    message: "Session retrieved successfully",
    data: {
      token,
      user: profile,
    },
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    throw new ErrorHandler("User not found", 404);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const profile = user.getProfile();

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: {
      user: profile,
    },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    throw new ErrorHandler("User not found", 404);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const { firstName, lastName } = req.body;

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: user.getProfile(),
    },
  });
});

export const updatePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    throw new ErrorHandler("User not found", 404);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const { currentPassword, newPassword } = req.body;

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new ErrorHandler("Invalid current password", 400);
  }

  user.hashed_password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// Email Update
export const updateEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    throw new ErrorHandler("User not found", 404);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const { email } = req.body;
  if (!validator.isEmail(email)) {
    throw new ErrorHandler("Invalid email", 400);
  }

  const tempEmail = new TempEmail({
    email: email,
    userId: user._id,
  });

  const saveEmail = await tempEmail.save();

  if (!saveEmail) {
    throw new ErrorHandler("Failed to send verification email", 500);
  }

  // send code in email

  res.status(201).json({
    success: true,
    message: "Check your email for verification link",
    data: {
      sessionId: saveEmail._id,
      email: email,
    },
  });
});

export const resendVerificationCode = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const { sessionId } = req.body;

  if (!userId) {
    throw new ErrorHandler("User not found", 404);
  }

  const tempEmail = await TempEmail.findById(sessionId);

  if (!tempEmail) {
    throw new ErrorHandler("Session Expired! Please refresh the page", 500);
  }

  const userName = await User.findById(userId).select("firstName lastName");
  const code = tempEmail.verificationCode;

  // send email

  res.status(200).json({
    success: true,
    message: "Verification code resent successfully",
    data: {
      sessionId: tempEmail._id,
      email: tempEmail.email,
    },
  });
});

export const verifyNewEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;

  if (!userId) {
    throw new ErrorHandler("User not found", 404);
  }

  const { sessionId, code } = req.body;

  const tempEmail = await TempEmail.findById(sessionId);

  if (!tempEmail) {
    throw new ErrorHandler("Invalid session", 400);
  }

  const isVerified = await tempEmail.verifyEmail(code);

  if (!isVerified) {
    throw new ErrorHandler("Invalid verification code", 400);
  }

  const user = await User.findById(tempEmail.userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  user.email = tempEmail.email;

  await user.save();

  tempEmail.deleteRecord();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});
