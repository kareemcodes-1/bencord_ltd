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

const paymentStatusStyles: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
};

export default function OrderDetails({ order }: Props) {

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

  const paymentStatus = order.paymentInfo.paymentStatus;

  return (<div> <Link
    href="/orders"
    className="mb-6 inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black sm:mb-8"
  > <ArrowLeft size={16} strokeWidth={1.5} />
    Back to orders </Link>

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
          className={`inline-flex w-fit items-center rounded-full border px-4 py-1.5 text-[.7rem] font-medium uppercase lg:text-[.8rem] ${statusStyles[order.orderStatus] ??
            "border-gray-200 bg-gray-50 text-gray-700"
            }`}
        >
          {order.orderStatus === "cancelled" && order.adminNote
            ? `Cancelled - ${order.adminNote}`
            : statusLabels[order.orderStatus] ?? order.orderStatus}
        </span>

        {order.shippingMethod && (
          <span className="inline-flex w-fit items-center rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-[.7rem] font-medium uppercase text-black/70 lg:text-[.8rem]">
            {order.shippingMethod === "pickup"
              ? "Store pickup"
              : "Door delivery"}
          </span>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5 sm:space-y-6">
        {/* Items */}
        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-[1.1rem] font-medium sm:mb-5">
            Items
          </h2>

          <div className="space-y-4 sm:space-y-5">
            {order.items.map((item) => {
              const image =
                item.media.find((media) => media.type === "image")?.url ||
                item.media[0]?.url;

              const hasDiscount =
                item.originalPrice > item.price;

              return (
                <div
                  key={item._id || item.productId}
                  className="flex gap-3 sm:gap-4"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-neutral-50 sm:h-20 sm:w-20">
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
                    <p className="text-sm font-medium">{item.name}</p>

                    <p className="mt-1 text-xs text-black/50">
                      Qty: {item.quantity}
                    </p>

                    {hasDiscount && (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-black/40 line-through">
                          {priceFormatter(item.originalPrice)}
                        </span>

                        {item.discount?.title && (
                          <span className="text-xs text-green-700">
                            {item.discount.title}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium">
                      {priceFormatter(
                        item.price * item.quantity,
                      )}
                    </p>

                    {hasDiscount && (
                      <p className="mt-1 text-xs text-black/40 line-through">
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
        </section>

        {/* Shipping or pickup details */}
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

            {order.shippingAddress.phone && (
              <p>{order.shippingAddress.phone}</p>
            )}

            <p>{order.shippingAddress.address}</p>

            {order.shippingAddress.apartment && (
              <p>{order.shippingAddress.apartment}</p>
            )}

            <p>
              {order.shippingAddress.city},{" "}
              {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>

            <p>{order.shippingAddress.country}</p>
          </div>
        </section>

        {/* Tracking */}
        {order.trackingNumber && (
          <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-2 text-[1.1rem] font-medium">Tracking</h2>

            <p className="font-mono text-sm text-black/70">
              {order.trackingNumber}
            </p>
          </section>
        )}

        {/* Admin note */}
        {order.adminNote && order.orderStatus !== "cancelled" && (
          <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-2 text-[1.1rem] font-medium">
              Order update
            </h2>

            <p className="whitespace-pre-wrap text-sm text-black/70">
              {order.adminNote}
            </p>
          </section>
        )}
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* Order summary */}
        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-[1.1rem] font-medium sm:mb-5">
            Order summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-black/60">Subtotal</span>
              <span>{priceFormatter(order.subtotal)}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-black/60">
                {order.shippingMethod === "pickup"
                  ? "Pickup"
                  : "Shipping"}
              </span>

              <span>
                {order.shippingFee === 0
                  ? "Free"
                  : priceFormatter(order.shippingFee)}
              </span>
            </div>

            {order.tax > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-black/60">Tax</span>
                <span>{priceFormatter(order.tax)}</span>
              </div>
            )}

            <div className="flex justify-between gap-4 border-t border-black/10 pt-3 text-base font-medium">
              <span>Total</span>
              <span>{priceFormatter(order.totalAmount)}</span>
            </div>
          </div>
        </section>

        {/* Bank transfer payment */}
        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-[1.1rem] font-medium">Payment</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-black/60">Method</span>
              <span className="font-medium">Bank transfer</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-black/60">Status</span>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatusStyles[paymentStatus] ??
                  "bg-gray-100 text-gray-700"
                  }`}
              >
                {paymentStatus === "paid" ? "Paid" : "Pending"}
              </span>
            </div>

            {order.paymentInfo.customerNotifiedAt && (
              <div className="flex justify-between gap-4">
                <span className="text-black/60">Transfer notification</span>
                <span className="text-right font-medium text-green-700">
                  Submitted
                </span>
              </div>
            )}

            {paidAt && (
              <div className="flex justify-between gap-4">
                <span className="text-black/60">Paid on</span>
                <span>{paidAt}</span>
              </div>
            )}

            {order.paymentInfo.transactionReference && (
              <div className="border-t border-black/10 pt-3">
                <p className="text-xs text-black/40">
                  Transaction reference
                </p>

                <p className="mt-1 break-all font-mono text-xs text-black/70">
                  {order.paymentInfo.transactionReference}
                </p>
              </div>
            )}

            {paymentStatus !== "paid" && (
              <p className="border-t border-black/10 pt-3 text-xs leading-5 text-black/50">
                Your order will be processed once your bank transfer has
                been received and verified.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  </div>


  );
}
