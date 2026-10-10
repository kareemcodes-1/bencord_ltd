import mongoose, { Document, Model, Schema } from "mongoose";

const orderMediaSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
  },
  { _id: true }
);

const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    media: {
      type: [orderMediaSchema],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: {
        title: { type: String, default: null },
        discountType: {
          type: String,
          enum: ["percentage", "fixed"],
        },
        discountValue: {
          type: Number,
          min: 0,
        },
      },
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: true }
);

const shippingAddressSchema = new Schema(
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
      default: "",
      trim: true,
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
  },
  { _id: false }
);

const paymentInfoSchema = new Schema(
  {
    paymentMethod: {
      type: String,
      enum: ["bank_transfer"],
      required: true,
      default: "bank_transfer",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      required: true,
      default: "pending",
    },
    transactionReference: {
      type: String,
      default: null,
      trim: true,
    },
    customerNotifiedAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type ShippingMethod = "pickup" | "delivery";

export interface IOrderDocument extends Document {
  userId: mongoose.Types.ObjectId;

  items: {
    _id: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    name: string;
    media: {
      _id: mongoose.Types.ObjectId;
      url: string;
      type: "image" | "video";
    }[];
    price: number;
    originalPrice: number;
    discount: {
      title: string | null;
      discountType: "percentage" | "fixed";
      discountValue: number;
    } | null;
    quantity: number;
  }[];

  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  paymentInfo: {
    paymentMethod: "bank_transfer";
    paymentStatus: "pending" | "paid";
    transactionReference: string | null;
    customerNotifiedAt: Date | null;
    paidAt: Date | null;
  };

  orderStatus: OrderStatus;
  shippingMethod: ShippingMethod;
  trackingNumber: string | null;
  adminNote: string | null;

  subtotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;

  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "An order must contain at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentInfo: {
      type: paymentInfoSchema,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "out_for_delivery",
        "ready_for_pickup",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    shippingMethod: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },

    trackingNumber: {
      type: String,
      default: null,
      trim: true,
    },

    adminNote: {
      type: String,
      default: null,
      trim: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Order: Model<IOrderDocument> =
  mongoose.models.Order ||
  mongoose.model<IOrderDocument>("Order", orderSchema);

export default Order;
