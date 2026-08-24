// app/orders/page.tsx
import { redirect } from "next/navigation";
import { getUserOrders } from "@/actions/order.actions";
import OrdersList from "./components/orders-list";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function OrdersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const { orders, totalOrders, totalPages, currentPage, error } =
    await getUserOrders(page);

  if (error === "Unauthorized") {
    redirect("/login?callbackUrl=/orders");
  }

  return (
    <div className="min-h-screen px-6 pb-24 pt-[9rem] lg:px-[3rem]">
     <div className="mx-auto mb-8 max-w-[60rem] text-center sm:mb-10 lg:mb-12">
        <span className="subtitle">Orders</span>
        <h1 className="heading-1 mt-3">Order History</h1>
        <p className="mx-auto mt-3 max-w-[22rem] text-sm text-black/50 sm:max-w-[28rem]">
  View your orders, check order details, and track your deliveries.
        </p>
      </div>

      <div className="mx-auto max-w-[72rem]">
        <OrdersList
          orders={orders}
          currentPage={currentPage}
          totalPages={totalPages}
          totalOrders={totalOrders}
        />
      </div>
    </div>
  );
}