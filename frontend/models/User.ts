
import mongoose, { Document, Model, Schema } from "mongoose";

const addressSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    apartment: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "user" | "admin";

  // Email verification
  emailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationCodeExpires?: Date;
  emailVerificationAttempts?: number;

  // Temporary token used to automatically log the user in
  // immediately after successful email verification.
  emailVerificationLoginToken?: string;
  emailVerificationLoginTokenExpires?: Date;

  addresses: {
    _id?: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }[];

  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // =========================
    // Email Verification
    // =========================

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationCode: {
      type: String,
      select: false,
    },

    emailVerificationCodeExpires: {
      type: Date,
      select: false,
    },

    emailVerificationAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    // Temporary login token
    // Created only after the correct verification code is entered.
    emailVerificationLoginToken: {
      type: String,
      select: false,
    },

    emailVerificationLoginTokenExpires: {
      type: Date,
      select: false,
    },

    // =========================
    // Addresses
    // =========================

    addresses: {
      type: [addressSchema],
      default: [],
    },

    // =========================
    // Password Reset
    // =========================

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUserDocument> =
  mongoose.models.User ||
  mongoose.model<IUserDocument>("User", userSchema);

export default User;

