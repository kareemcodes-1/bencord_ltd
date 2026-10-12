export interface Category{
  _id: string;
  name: string;
  slug: string;
  image: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}


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
  phone?: string;
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


export interface ProductMedia {
  _id: string;
  url: string;
  type: ProductMediaType;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  categoryId: Category;
  description: string;
  price: number;

  discount?: {
    discountType: "percentage" | "fixed";
    discountValue: number;
    title?: string;
  } | null;

  media: ProductMedia[];

  featured: boolean;

  inStock: boolean;

  averageRating: number;
  reviewCount: number;

  createdAt: string;
  updatedAt: string;
}


export interface Discount {
  _id: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  productIds: string[] | { _id: string; name: string; slug?: string }[];
  startsAt: string | Date;
  expiresAt: string | Date;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Category{
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
  phone?: string;
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

export interface Product {
  _id: string;
  name: string;
  slug: string;
  categoryId: Category;
  description: string;
  price: number;

  discount?: {
    discountType: "percentage" | "fixed";
    discountValue: number;
    title?: string;
  } | null;

  media: ProductMedia[];

  featured: boolean;

  inStock: boolean;

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
  originalPrice: number;
  discount: {
    title: string | null;
    discountType: "percentage" | "fixed";
    discountValue: number;
  } | null;
  quantity: number;

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

export type PaymentMethod = "bank_transfer";

export type PaymentStatus = "pending" | "paid";

export interface PaymentInfo {
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference: string | null;
  customerNotifiedAt: string | null;
  paidAt: string | null;
}


export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type ShippingMethod = "pickup" | "delivery";

export interface Order {
  _id: string;
  userId: string | {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  orderStatus: OrderStatus;
  adminNote: string | null;
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

export interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  source?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ShippingRate {
  _id: string;
  location: string;
  fee: number;
  country?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}