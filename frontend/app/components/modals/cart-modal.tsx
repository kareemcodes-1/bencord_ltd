"use client";

import Image from "next/image";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { priceFormatter } from "@/lib/priceFormatter";
import EmptyState from "../empty-state";
import { useRouter } from "next/navigation";

interface CartModalProps {
  openCartModal: boolean;
  setOpenCartModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartModal = ({ openCartModal, setOpenCartModal }: CartModalProps) => {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const hasHydrated = useCartStore((s) => s._hasHydrated);
  const router = useRouter();

  const handleDecrease = (
    productId: string,
    quantity: number,
    size: string | null,
  ) => {
    updateQuantity(productId, quantity - 1, size);
  };

  const handleIncrease = (
    productId: string,
    quantity: number,
    size: string | null,
  ) => {
    updateQuantity(productId, quantity + 1, size);
  };

  const subtotal = getSubtotal();

  const handleCheckout = () => {
    setOpenCartModal(false);
    router.push("/checkout");
  };

  return (
    <Sheet open={openCartModal} onOpenChange={setOpenCartModal}>
      <SheetContent
        side="right"
        className="z-[350] flex h-full w-full max-w-full flex-col gap-0 border-l border-black/10 bg-white p-0 sm:max-w-[28rem] lg:max-w-[32rem] [&>button]:hidden"
      >
        {/* Header */}
        <SheetHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b px-5 py-4 sm:px-6 sm:py-5 lg:px-8">
          <SheetTitle className="heading-3 text-left">Cart
            {hasHydrated && totalItems > 0 && (
              <span className="ml-1.5 text-black">
                ({totalItems > 99 ? "99+" : totalItems})
              </span>
            )}
          </SheetTitle>

          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close cart"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-colors duration-300 hover:bg-[#ee0a0a] hover:text-white sm:h-10 sm:w-10"
            >
              <X size={18} strokeWidth={1.5} className="sm:size-5" />
            </button>
          </SheetClose>
        </SheetHeader>

        {/* Items */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 lg:px-8">
          {items.length > 0 ? (
            <div className="flex flex-col">
              {items.map((item) => {
                const image =
                  item.media.find((media) => media.type === "image")?.url ??
                  item.media[0]?.url;

                const hasDiscount =
                  item.originalPrice && item.originalPrice > item.price;

                return (
                  <div
                    key={`${item.productId}-${item.size ?? "default"}`}
                    className="flex w-full items-start gap-3 border-b border-black/10 py-4 sm:gap-4 sm:py-5"
                  >
                    <div className="relative w-16 shrink-0 overflow-hidden rounded-lg border border-black/5  sm:h-20 sm:w-20">
                      {image && (
                        <Image
                          src={image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-contain"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-black">
                            {item.name}
                          </p>
                          {item.size && (
                            <p className="mt-1 text-xs text-black/50">
                              {item.size}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col items-end">
                          <span className="text-sm font-medium text-black/70">
                            {priceFormatter(item.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-black/40 line-through">
                              {priceFormatter(item.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between sm:mt-4">
                        <div className="flex items-center gap-3 rounded-[.75rem] border border-black/15 px-2.5 py-1.5 sm:gap-4 sm:px-3">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              handleDecrease(
                                item.productId,
                                item.quantity,
                                item.size,
                              )
                            }
                            className="cursor-pointer text-black/50 transition-colors hover:text-black"
                          >
                            <Minus size={13} strokeWidth={1.5} />
                          </button>
                          <span className="min-w-4 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              handleIncrease(
                                item.productId,
                                item.quantity,
                                item.size,
                              )
                            }
                            className="cursor-pointer text-black/50 transition-colors hover:text-black"
                          >
                            <Plus size={13} strokeWidth={1.5} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.size)}
                          aria-label={`Remove ${item.name}`}
                          className="cursor-pointer text-black/30 transition-colors hover:text-black"
                        >
                          <X size={20} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              message="Your cart is empty"
              buttonText="Continue Shopping"
              buttonHref="/shop"
            />
          )}
        </div>

        {items.length > 0 && (
          <>
            <div className="shrink-0 border-t border-black/10 px-5 pb-3 pt-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Subtotal</span>
                <span className="text-sm font-medium">
                  {priceFormatter(subtotal)}
                </span>
              </div>
               <p className="mt-2 text-xs text-black/50">
        Taxes and duties are calculated during checkout
      </p>
            </div>

            <div className="shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6 lg:px-8">
              <button
                type="button"
                className="btn-primary w-full"
                onClick={handleCheckout}
              >
                 Secure Checkout
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartModal;