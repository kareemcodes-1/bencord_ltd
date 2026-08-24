
export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "user" | "admin";

export interface Address {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export type ProductMediaType = "image" | "video";

export interface ProductMedia {
  _id: string;
  url: string;
  type: ProductMediaType;
}

export interface ShippingAndReturns {
  deliveryTime: string;
  returnsPolicy: string;
}


export interface Product {
  _id: string;
  name: string;
  slug: string;
  categoryId: Category;
  description: string;
  price: number;

  media: ProductMedia[];

  featured: boolean;

  trackInventory: boolean;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;

  averageRating: number;
  reviewCount: number;

  createdAt: string;
  updatedAt: string;
}



export type DiscountType = "percentage" | "fixed";

export interface Discount {
  _id: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  productIds: string[] | { _id: string; name: string; slug?: string }[];
  minimumAmount: number;
  maxDiscount: number;
  startsAt: string | Date;
  expiresAt: string | Date;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type OrderMediaType = "image" | "video";

export interface OrderMedia {
  _id: string;
  url: string;
  type: OrderMediaType;
}

export interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  media: OrderMedia[];
  price: number;
  quantity: number;
  size?: string | null;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export type PaymentGateway = "flutterwave";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface PaymentInfo {
  transactionId: string;
  gateway: PaymentGateway;
  paymentStatus: PaymentStatus;
  channel: string | null;
  paidAt: string | null;
}

export type OrderStatus =
  | "processing"
  | "confirmed"
  | "shipped"
  | "ready_for_pickup"
  | "delivered"
  | "cancelled";

export type ShippingMethod = "pickup" | "delivery";

export interface Order {
  _id: string;
  userId: string | { _id: string; name?: string; email?: string; phone?: string };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  orderStatus: OrderStatus;
  shippingMethod: ShippingMethod;
  trackingNumber: string | null;
  subtotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  productId:
    | string
    | {
        _id: string;
        name: string;
        slug: string;
      };
  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}


