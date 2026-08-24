import mongoose, { Document, Model, Schema } from "mongoose";

const productMediaSchema = new Schema(
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



export interface IProductDocument extends Document {
  name: string;
  slug: string;
  categoryId: mongoose.Types.ObjectId;
  description: string;
  price: number;

  media: {
    _id: mongoose.Types.ObjectId;
    url: string;
    type: "image" | "video";
  }[];

  featured: boolean;

  trackInventory: boolean;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;

  averageRating: number;
  reviewCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    media: {
      type: [productMediaSchema],
      default: [],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    trackInventory: {
      type: Boolean,
      default: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },


    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

  },
  {
    timestamps: true,
  }
);

productSchema.virtual("inStock").get(function () {
  if (!this.trackInventory) return this.isActive;

  return this.isActive && this.stock > 0;
});

productSchema.virtual("isLowStock").get(function () {
  if (!this.trackInventory) return false;

  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

productSchema.virtual("isOutOfStock").get(function () {
  if (!this.trackInventory) return false;

  return this.stock <= 0;
});


const Product: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>("Product", productSchema);

export default Product;