// components/orders/orders-list.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Package } from "lucide-react";
import OrderCard from "./order-card";
import Pagination from "@/app/components/pagination";
import EmptyState from "@/app/components/empty-state";
import { Order } from "@/types";

type Props = {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  totalOrders: number;
};

export default function OrdersList({
  orders,
  currentPage,
  totalPages,
  totalOrders,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/orders?${params.toString()}`);
  };

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        message="No orders yet."
        buttonText="Start Shopping"
        buttonHref="/shop"
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-[0.7rem] uppercase tracking-[0.05em] text-black/50">
          {totalOrders} {totalOrders === 1 ? "order" : "orders"}
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-8 sm:mt-12"
      />
    </div>
  );
}