import mongoose, { Document, Model, Schema } from "mongoose";
import crypto from "crypto";

export interface ISubscriberDocument extends Document {
  email: string;
  isActive: boolean;
  source?: string;
  unsubscribeToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<ISubscriberDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      default: "cta",
      trim: true,
    },
    unsubscribeToken: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(24).toString("hex"),
    },
  },
  {
    timestamps: true,
  }
);

const Subscriber: Model<ISubscriberDocument> =
  mongoose.models.Subscriber ||
  mongoose.model<ISubscriberDocument>("Subscriber", subscriberSchema);

export default Subscriber;