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
  {
    _id: true,
  }
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: true,
  }
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
  {
    _id: false,
  }
);

const paymentInfoSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
    gateway: {
      type: String,
      enum: ["flutterwave"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      required: true,
    },
    channel: {
      type: String,
      default: null,
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

export type OrderStatus =
  | "processing"
  | "confirmed"
  | "shipped"
  | "ready_for_pickup"
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
    transactionId: string;
    gateway: "flutterwave";
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    channel: string | null;
    paidAt: Date | null;
  };

  orderStatus: OrderStatus;
  shippingMethod: ShippingMethod;
  trackingNumber: string | null;

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
        "processing",
        "confirmed",
        "shipped",
        "ready_for_pickup",
        "delivered",
        "cancelled",
      ],
      default: "processing",
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