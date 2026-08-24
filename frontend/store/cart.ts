// store/cart.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";

import type { Product } from "@/types";
import { getProductPricing } from "@/lib/product-pricing";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number; // final price (after discount)
  originalPrice: number; // original price (before discount)
  quantity: number;
  size: string | null;
  media: Product["media"];
}

interface CartState {
  items: CartItem[];
  _hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;

  addItem: (
    product: Product,
    quantity?: number,
    size?: string | null,
  ) => void;

  removeItem: (
    productId: string,
    size?: string | null,
  ) => void;

  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string | null,
  ) => void;

  clearCart: () => void;

  getItemQuantity: (
    productId: string,
    size?: string | null,
  ) => number;

  getTotalItems: () => number;

  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      addItem: (product, quantity = 1, size = null) => {
        const { originalPrice, finalPrice } = getProductPricing(product);

        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.productId === product._id && item.size === size,
          );

          if (existingItemIndex !== -1) {
            const updatedItems = [...state.items];

            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity:
                updatedItems[existingItemIndex].quantity + quantity,
              // keep price in sync in case discount changed
              price: finalPrice,
              originalPrice,
            };

            return { items: updatedItems };
          }

          const newItem: CartItem = {
            productId: product._id,
            name: product.name,
            slug: product.slug,
            price: finalPrice,
            originalPrice,
            quantity,
            size,
            media: product.media,
          };

          return {
            items: [...state.items, newItem],
          };
        });

        toast.success(`${product.name} added to cart`);
      },

      removeItem: (productId, size = null) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.productId === productId && item.size === size),
          ),
        }));

        toast.success("Removed from cart");
      },

      updateQuantity: (productId, quantity, size = null) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity }
              : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemQuantity: (productId, size = null) => {
        const item = get().items.find(
          (item) =>
            item.productId === productId && item.size === size,
        );

        return item?.quantity ?? 0;
      },

      getTotalItems: () => {
        return get().items.reduce(
          (total, item) => total + item.quantity,
          0,
        );
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "bencord-cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);