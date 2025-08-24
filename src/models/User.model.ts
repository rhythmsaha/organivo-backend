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
  verificationCode?: string;

  // Methods
  comparePassword: (enteredPassword: string) => Promise<boolean>;
  signAccessToken: () => string;
  getProfile: () => object;
  generateVerificationCode: () => Promise<string>;
  verifyEmail: (code: string) => Promise<boolean>;
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

    verificationCode: {
      type: String,
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

      generateVerificationCode: async function () {
        const code = crypto.randomInt(100000, 999999).toString();
        this.verificationCode = code;
        await this.save();
        return code;
      },

      verifyEmail: async function (code: string) {
        if (this.verificationCode === code) {
          this.verified = true;
          this.verificationCode = undefined;
          await this.save();
          return true;
        }
        return false;
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

export interface ITempEmail extends Document {
  email: string;
  verificationCode: string | null;
  userId: string;
  verified: boolean;

  verifyEmail: (code: string) => Promise<boolean>;
  deleteRecord: () => Promise<void>;
}

const TempEmailSchema = new Schema<ITempEmail>(
  {
    userId: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },

    verificationCode: {
      type: String,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    methods: {
      verifyEmail: async function (code: string) {
        if (this.verificationCode === code) {
          this.verified = true;
          this.verificationCode = null;
          await this.save();
          return true;
        }

        return false;
      },

      deleteRecord: async function () {
        await this.deleteOne();
      },
    },
  }
);

TempEmailSchema.pre<ITempEmail>("save", async function (next) {
  if (!this.isModified("verificationCode")) return next();

  const code = crypto.randomInt(100000, 999999).toString();
  this.verificationCode = code;
  await this.save();
  next();
});

const TempEmail: Model<ITempEmail> = model<ITempEmail>("TempEmail", TempEmailSchema);
export { TempEmail };
