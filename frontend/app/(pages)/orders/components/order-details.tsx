// components/orders/order-details.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCurrencyStore } from "@/store/currency";
import { priceFormatter } from "@/lib/priceFormatter";
import type { Order } from "@/types";

type Props = {
  order: Order;
};

const statusStyles: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  shipped: "bg-blue-100 text-blue-700 border-blue-200",
  out_for_delivery: "bg-orange-50 text-orange-700 border-orange-200",
  ready_for_pickup: "bg-green-100 text-green-700 border-green-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  ready_for_pickup: "Ready for pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetails({ order }: Props) {
  const currency = useCurrencyStore((s) => s.currency);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const paidAt = order.paymentInfo.paidAt
    ? new Date(order.paymentInfo.paidAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div>
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black sm:mb-8"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to orders
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="heading-2">
  Order #{String(order._id).slice(-8).toUpperCase()}
</h1>
          <p className="mt-2 text-sm text-black/50">
            Placed on {formattedDate}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex w-fit items-center rounded-full border px-4 py-1.5 text-[.6rem] lg:text-[.7rem] font-medium uppercase ${
              statusStyles[order.orderStatus] ||
              "border-gray-200 bg-gray-50 text-gray-700"
            }`}
          >
            {statusLabels[order.orderStatus] || order.orderStatus}
          </span>

          {order.shippingMethod && (
            <span className="inline-flex w-fit items-center rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-[.6rem] lg:text-[.7rem] font-medium uppercase text-black/70">
              {order.shippingMethod === "pickup"
                ? "Store pickup"
                : "Door delivery"}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5 sm:space-y-6">
          <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-[1.1rem] font-medium sm:mb-5">Items</h2>

            <div className="space-y-4 sm:space-y-5">
              {order.items.map((item) => {
                const image =
                  item.media.find((m) => m.type === "image")?.url ||
                  item.media[0]?.url;

                return (
                  <div
                    key={item._id || item.productId}
                    className="flex gap-3 sm:gap-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border sm:h-20 sm:w-20">
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
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-medium">
                      {priceFormatter(item.price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-[1.1rem] font-medium">
              {order.shippingMethod === "pickup"
                ? "Pickup details"
                : "Shipping address"}
            </h2>

            <div className="space-y-1 text-sm text-black/70">
              <p className="font-medium text-black">
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address}</p>
              {order.shippingAddress.apartment && (
                <p>{order.shippingAddress.apartment}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </section>

          {order.trackingNumber && (
            <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-2 text-[1.1rem] font-medium">Tracking</h2>
              <p className="font-mono text-sm text-black/70">
                {order.trackingNumber}
              </p>
            </section>
          )}
        </div>

        <div className="space-y-5 sm:space-y-6">
          <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-[1.1rem] font-medium sm:mb-5">
              Order summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-black/60">Subtotal</span>
                <span>{priceFormatter(order.subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-black/60">
                  {order.shippingMethod === "pickup" ? "Pickup" : "Shipping"}
                </span>
                <span>
                  {order.shippingFee === 0
                    ? "Free"
                    : priceFormatter(order.shippingFee)}
                </span>
              </div>

              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-black/60">Tax</span>
                  <span>{priceFormatter(order.tax)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-black/10 pt-3 text-base font-medium">
                <span>Total</span>
                <span>{priceFormatter(order.totalAmount)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-[1.1rem] font-medium">Payment</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-black/60">Status</span>
                <span className="font-medium capitalize">
                  {order.paymentInfo.paymentStatus}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-black/60">Method</span>
                <span className="capitalize">
                  {order.paymentInfo.channel || order.paymentInfo.gateway}
                </span>
              </div>

              {paidAt && (
                <div className="flex justify-between">
                  <span className="text-black/60">Paid on</span>
                  <span>{paidAt}</span>
                </div>
              )}

              <div className="pt-2">
                <p className="text-xs text-black/40">Reference</p>
                <p className="mt-0.5 break-all font-mono text-xs text-black/70">
                  {order.paymentInfo.transactionId}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}