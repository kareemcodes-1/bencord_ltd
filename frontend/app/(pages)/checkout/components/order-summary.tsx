"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { priceFormatter } from "@/lib/priceFormatter";

type Props = {
  shippingFee: number;
};

export default function OrderSummary({ shippingFee }: Props) {
  const { items, getSubtotal } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);

  const subtotal = getSubtotal();
  const total = subtotal + shippingFee;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28 lg:p-8">
      <h2 className="mb-5 text-[1.1rem] font-medium sm:mb-6 sm:text-[1.2rem]">
        Order summary
      </h2>

      <div className="space-y-4 sm:space-y-5">
        {items.map((item) => {
          const image =
            item.media.find((m) => m.type === "image")?.url ??
            item.media[0]?.url;

          const hasDiscount =
            item.originalPrice && item.originalPrice > item.price;

          return (
            <div
              key={`${item.productId}-${item.size ?? "default"}`}
              className="flex gap-3 sm:gap-4"
            >
              <div className="relative h-14 w-14 shrink-0  rounded-lg border sm:h-16 sm:w-16">
                {image && (
                  <Image
                    src={image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                )}
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
                  {item.quantity}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                {item.size && (
                  <p className="mt-0.5 text-xs text-black/50">{item.size}</p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end">
                <p className="text-sm font-medium">
                  {priceFormatter(item.price * item.quantity)}
                </p>
                {hasDiscount && (
                  <p className="text-xs text-black/40 line-through">
                    {priceFormatter(
                      item.originalPrice * item.quantity,
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-3 border-t border-black/10 pt-4 sm:mt-6 sm:pt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-black/60">Subtotal</span>
          <span>{priceFormatter(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-black/60">Shipping</span>
          <span>
            {shippingFee === 0
              ? "Free"
              : priceFormatter(shippingFee)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-black/10 pt-4 text-base font-medium">
          <span>Total</span>
          <span>{priceFormatter(total)}</span>
        </div>
      </div>
    </div>
  );
}