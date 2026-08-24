// components/orders/order-card.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCurrencyStore } from "@/store/currency";
import { priceFormatter } from "@/lib/priceFormatter";
import type { Order } from "@/types";
import { ChevronRight } from "lucide-react";

type Props = {
  order: Order;
};

const statusStyles: Record<string, string> = {
processing: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  shipped: "bg-blue-100 text-blue-700 border-blue-200",
  ready_for_pickup: "bg-green-100 text-green-700 border-green-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  processing: "Processing",
  confirmed: "Confirmed",
  shipped: "Shipped",
  ready_for_pickup: "Ready for pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderCard({ order }: Props) {
  const currency = useCurrencyStore((s) => s.currency);

  const firstImage =
    order.items[0]?.media?.find((m) => m.type === "image")?.url ||
    order.items[0]?.media?.[0]?.url;

  const totalItems = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group rounded-2xl border border-black/8 bg-white p-5 transition-all duration-300 hover:border-black/15 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:p-6">
      {/* Top */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-black/40">{formattedDate}</p>

        <span
          className={`rounded-full border px-2.5 py-1 font-medium text-[.6rem] lg:text-[.7rem] uppercase tracking-wide ${
            statusStyles[order.orderStatus] || "bg-gray-50 text-gray-600"
          }`}
        >
          {statusLabels[order.orderStatus] || order.orderStatus}
        </span>
      </div>

      {/* Main */}
      <div className="mt-5 flex items-center gap-4">
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border">
          {firstImage && (
            <Image
              src={firstImage}
              alt={order.items[0]?.name || "Product"}
              fill
              sizes="72px"
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium tracking-[-0.01em] text-black">
            {order.items[0]?.name}
            {order.items.length > 1 && (
              <span className="font-normal text-black/40">
                {" "}
                +{order.items.length - 1} more
              </span>
            )}
          </p>

          <p className="mt-1 text-[13px] text-black/40">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>

          <p className="mt-2 text-[15px] font-medium tracking-[-0.01em]">
            {priceFormatter(order.totalAmount)}
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4">
        <p className="font-mono text-[12px] text-black/30">
          {order.paymentInfo.transactionId}
        </p>

        <Link
    href={`/orders/${order._id}`}
    className="flex items-center justify-center text-[#ee0a0a] transition-opacity hover:opacity-70"
  >
    {/* Mobile: arrow button */}
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ee0a0a]/20 bg-[#ee0a0a]/5 sm:hidden">
      <ChevronRight size={18} strokeWidth={1.75} />
    </span>

    {/* Desktop: text */}
    <span className="hidden text-[13px] font-medium sm:inline">
      View details
    </span>
  </Link>
      </div>
    </div>
  );
}