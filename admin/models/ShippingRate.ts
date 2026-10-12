import mongoose, { Document, Model, Schema } from "mongoose";

export interface IShippingRateDocument extends Document {
  location: string;          // e.g. "Accra", "Kumasi", "Tema", "East Legon"
  fee: number;               // delivery fee for this location
  country?: string;          // optional, default "GH"
  isActive: boolean;         // so admin can disable without deleting
  createdAt: Date;
  updatedAt: Date;
}

const shippingRateSchema = new Schema<IShippingRateDocument>(
  {
    location: {
      type: String,
      required: true,
      trim: true,
      unique: true,            // prevent duplicate locations
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    country: {
      type: String,
      default: "GH",
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ShippingRate: Model<IShippingRateDocument> =
  mongoose.models.ShippingRate ||
  mongoose.model<IShippingRateDocument>("ShippingRate", shippingRateSchema);

export default ShippingRate;