"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getUser } from "@/actions/admin/user.actions";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeftIcon,
  PackageIcon,
  MapPinIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
} from "lucide-react";
import { priceFormatter } from "@/lib/priceFormatter";


function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: string | Date) {
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

function UserDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6 p-6">
          <UserDetailSkeleton />
        </div>
      </main>
    );
  }

  if (isError || !user) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="@container/main mx-auto flex max-w-4xl flex-1 flex-col gap-6 p-6">
          <div className="space-y-4 text-center">
            <h1 className="text-xl font-semibold">User not found</h1>
            <p className="text-sm text-muted-foreground">
              This user could not be loaded.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/users")}
            >
              <ArrowLeftIcon />
              Back to users
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const orders = user.orders ?? [];
  const addresses = user.addresses ?? [];

  return (
    <main className="flex flex-1 flex-col">
      <div className="@container/main mx-auto w-full max-w-4xl flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to users
          </button>

          <h1 className="text-2xl font-semibold tracking-tight">
            {user.name}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Orders
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {user.orderCount ?? orders.length}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Addresses
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {addresses.length}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Joined
            </p>
            <p className="mt-1 text-sm font-medium">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Contact
          </h2>
          <div className="space-y-3 rounded-xl border p-4 text-sm">
            <div className="flex items-center gap-3">
              <MailIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>{user.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </section>

        {/* Addresses */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Addresses ({addresses.length})
          </h2>

          {addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No addresses saved
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div
                  key={String(addr._id)}
                  className="space-y-1 rounded-xl border p-4 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">
                      {addr.firstName} {addr.lastName}
                    </p>
                    {addr.isDefault && (
                      <Badge variant="secondary" className="text-[10px]">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-0.5 text-muted-foreground">
                    <p className="flex items-start gap-1.5">
                      <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
                      <span>
                        {addr.address}
                        {addr.apartment ? `, ${addr.apartment}` : ""}
                      </span>
                    </p>
                    <p className="pl-5">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p className="pl-5">{addr.country}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Orders */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              <PackageIcon className="mx-auto mb-2 size-5 opacity-50" />
              No orders yet
            </div>
          ) : (
            <div className="divide-y rounded-xl border">
              {orders.map((order) => {
                const status = getStatusBadge(order.orderStatus);

                return (
                  <button
                    key={String(order._id)}
                    type="button"
                    onClick={() =>
                      router.push(`/admin/orders/${order._id}`)
                    }
                    className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-medium">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(order.createdAt)} ·{" "}
                        {order.items?.length ?? 0} item
                        {(order.items?.length ?? 0) === 1 ? "" : "s"}
                      </p>
                    </div>

                    <Badge className={status.className}>
                      {status.label}
                    </Badge>

                    <p className="shrink-0 text-sm font-medium tabular-nums">
                      {priceFormatter(order.totalAmount)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}