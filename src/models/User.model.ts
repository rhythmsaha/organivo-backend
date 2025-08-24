import { Document, Schema, Model, model } from "mongoose";
import validator from "validator";
import crypto from "node:crypto";
import { HASH_PW_SALT, JWT_EXPIRES_IN, JWT_SECRET } from "../config/env";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  hashed_password: string;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Methods
  comparePassword: (enteredPassword: string) => Promise<boolean>;
  signAccessToken: () => string;
  getProfile: () => object;
}

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
      validate: [validator.isAlpha, "Please provide a valid first name"],
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [50, "First name must be at most 50 characters long"],
      lowercase: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
      validate: [validator.isAlpha, "Please provide a valid last name"],
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name must be at most 50 characters long"],
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please provide an email address"],
      validate: [validator.isEmail, "Please provide a valid email address"],
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
    },

    hashed_password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    methods: {
      comparePassword: async function (enteredPassword: string) {
        const hashed = crypto.pbkdf2Sync(enteredPassword, HASH_PW_SALT, 1000, 64, "sha512").toString("hex");
        return this.hashed_password === hashed;
      },

      signAccessToken: function () {
        return jwt.sign({ id: this._id }, JWT_SECRET as never, {
          expiresIn: (JWT_EXPIRES_IN as never) || "1d",
        });
      },

      getProfile: function () {
        return {
          _id: this._id,
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          verified: this.verified,
        };
      },
    },
  }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("hashed_password")) return next();

  const salt = HASH_PW_SALT;
  this.hashed_password = crypto.pbkdf2Sync(this.hashed_password, salt!, 1000, 64, "sha512").toString("hex");
  next();
});

const User: Model<IUser> = model<IUser>("User", UserSchema);
export default User;
