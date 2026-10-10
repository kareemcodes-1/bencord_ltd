"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getOrder } from "@/actions/admin/order.actions";

import { PageHeader } from "@/app/components/page-header";
import { OrderStatusDialog } from "@/app/components/orders/order-dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeftIcon,
  PencilIcon,
  PackageIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
} from "lucide-react";

import { priceFormatter } from "@/lib/priceFormatter";

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Pending",
      className:
        "border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100",
    },
    confirmed: {
      label: "Confirmed",
      className:
        "border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
    },
    shipped: {
      label: "Shipped",
      className:
        "border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100",
    },
    out_for_delivery: {
      label: "Out for delivery",
      className:
        "border-purple-200 bg-purple-100 text-purple-700 hover:bg-purple-100",
    },
    ready_for_pickup: {
      label: "Ready for pickup",
      className:
        "border-green-200 bg-green-100 text-green-700 hover:bg-green-100",
    },
    delivered: {
      label: "Delivered",
      className:
        "border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
    },
    cancelled: {
      label: "Cancelled",
      className:
        "border-red-200 bg-red-100 text-red-700 hover:bg-red-100",
    },
  };

  return (
    map[status] ?? {
      label: status,
      className: "border-border bg-muted text-muted-foreground",
    }
  );
}

function getPaymentBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    paid: {
      label: "Paid",
      className:
        "border-green-200 bg-green-100 text-green-700 hover:bg-green-100",
    },
    pending: {
      label: "Pending",
      className:
        "border-yellow-200 bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    },
  };

  return (
    map[status] ?? {
      label: status,
      className: "border-border bg-muted text-muted-foreground",
    }
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />

      <Skeleton className="h-10 w-full rounded-xl" />

      <Skeleton className="h-80 w-full rounded-xl" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <OrderDetailSkeleton />
        </div>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <PageHeader
            title="Order not found"
            description="This order could not be loaded."
            action={
              <Button
                variant="outline"
                onClick={() => router.push("/admin/orders")}
              >
                <ArrowLeftIcon />
                Back to orders
              </Button>
            }
          />
        </div>
      </main>
    );
  }

  const status = getStatusBadge(order.orderStatus);
  const payment = getPaymentBadge(order.paymentInfo.paymentStatus);
  const address = order.shippingAddress;

  const customer =
    typeof order.userId === "object" && order.userId !== null
      ? (order.userId as {
          name?: string;
          email?: string;
          phone?: string;
        })
      : null;

  return (
    <main className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        {/* Header */}
        <PageHeader
          title={`Order #${String(order._id).slice(-8).toUpperCase()}`}
          description={`Placed on ${formatDate(order.createdAt)}`}
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/orders")}
              >
                <ArrowLeftIcon />
                Back
              </Button>

              <Button onClick={() => setDialogOpen(true)}>
                <PencilIcon />
                Update status
              </Button>
            </div>
          }
        />

        {/* Order and payment status */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={status.className}>
            {status.label}
          </Badge>

          <Badge className={payment.className}>
            {payment.label}
          </Badge>

          {order.trackingNumber && (
            <span className="text-sm text-muted-foreground">
              Tracking:{" "}
              <span className="font-mono font-medium text-foreground">
                {order.trackingNumber}
              </span>
            </span>
          )}
        </div>

        {/* Order items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PackageIcon className="size-4" />
              Items ({order.items.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {order.items.map((item) => {
                const image = item.media?.find(
                  (media) => media.type === "image"
                );

                return (
                  <div
                    key={String(item._id)}
                    className="flex min-w-0 gap-3 rounded-lg border"
                    style={{ padding: "0.5rem 0.75rem" }}
                  >
                    <div
                      className="relative shrink-0 overflow-hidden rounded-md border bg-muted"
                      style={{
                        width: "56px",
                        height: "56px",
                        minWidth: "56px",
                        minHeight: "56px",
                      }}
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PackageIcon className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {item.name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Qty {item.quantity} ×{" "}
                        {priceFormatter(item.price)}
                      </p>

                      <p className="mt-1 font-medium tabular-nums">
                        {priceFormatter(
                          item.price * item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Order totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal
                </span>

                <span className="tabular-nums">
                  {priceFormatter(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Shipping
                </span>

                <span className="tabular-nums">
                  {priceFormatter(order.shippingFee)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tax
                </span>

                <span className="tabular-nums">
                  {priceFormatter(order.tax)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>

                <span className="tabular-nums">
                  {priceFormatter(order.totalAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer, Payment, Shipping and Tracking */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Customer
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">
                {address.firstName} {address.lastName}
              </p>

              {customer?.email && (
                <p className="text-muted-foreground">
                  {customer.email}
                </p>
              )}

              {customer?.phone && (
                <p className="text-muted-foreground">
                  {customer.phone}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCardIcon className="size-4" />
                Payment
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Method
                </span>

                <span className="font-medium">
                  {order.paymentInfo.paymentMethod === "bank_transfer"
                    ? "Bank transfer"
                    : order.paymentInfo.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Status
                </span>

                <Badge className={payment.className}>
                  {payment.label}
                </Badge>
              </div>

              {order.paymentInfo.customerNotifiedAt && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Customer notified
                  </span>

                  <span className="text-right">
                    {formatDate(
                      order.paymentInfo.customerNotifiedAt
                    )}
                  </span>
                </div>
              )}

              {order.paymentInfo.transactionReference && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Reference
                  </span>

                  <span className="max-w-[200px] truncate font-mono text-xs">
                    {order.paymentInfo.transactionReference}
                  </span>
                </div>
              )}

              {order.paymentInfo.paidAt && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Paid at
                  </span>

                  <span className="text-right">
                    {formatDate(order.paymentInfo.paidAt)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping address */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPinIcon className="size-4" />
                Shipping address
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 text-sm">
              <p>
                {address.firstName} {address.lastName}
              </p>

              <p className="text-muted-foreground">
                {address.address}
              </p>

              {address.apartment && (
                <p className="text-muted-foreground">
                  {address.apartment}
                </p>
              )}

              <p className="text-muted-foreground">
                {address.city}, {address.state}{" "}
                {address.postalCode}
              </p>

              <p className="text-muted-foreground">
                {address.country}
              </p>
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TruckIcon className="size-4" />
                Tracking
              </CardTitle>
            </CardHeader>

            <CardContent className="text-sm">
              {order.trackingNumber ? (
                <p className="font-mono font-medium">
                  {order.trackingNumber}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  No tracking number yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <OrderStatusDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          order={order}
        />
      </div>
    </main>
  );
}