"use client";

import * as React from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2Icon } from "lucide-react";

import type { Order } from "@/types";
import {
  updateOrder,
  type OrderStatus,
  type UpdateOrderPayload,
} from "@/actions/admin/order.actions";

import toast from "react-hot-toast";

interface OrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
}

const ALL_STATUSES: {
  value: OrderStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "ready_for_pickup", label: "Ready for pickup" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function getStatusesForShippingMethod(shippingMethod?: string | null) {
  if (shippingMethod === "pickup") {
    return ALL_STATUSES.filter(
      (status) =>
        status.value !== "shipped" &&
        status.value !== "out_for_delivery"
    );
  }

  if (shippingMethod === "delivery") {
    return ALL_STATUSES.filter(
      (status) => status.value !== "ready_for_pickup"
    );
  }

  return ALL_STATUSES;
}

export function OrderStatusDialog({
  open,
  onOpenChange,
  order,
}: OrderStatusDialogProps) {
  const queryClient = useQueryClient();

  const [orderStatus, setOrderStatus] =
    React.useState<OrderStatus>("pending");

  const [trackingNumber, setTrackingNumber] =
    React.useState("");

  const [adminNote, setAdminNote] = React.useState("");

  const availableStatuses = React.useMemo(
    () => getStatusesForShippingMethod(order?.shippingMethod),
    [order?.shippingMethod]
  );

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrderPayload) =>
      updateOrder(order!._id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success("Order updated");
      onOpenChange(false);
    },

    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update order"
      );
    },
  });

  React.useEffect(() => {
    if (!open || !order) return;

    const allowedStatuses = getStatusesForShippingMethod(
      order.shippingMethod
    ).map((status) => status.value);

    const nextStatus = allowedStatuses.includes(order.orderStatus)
      ? order.orderStatus
      : "pending";

    setOrderStatus(nextStatus);
    setTrackingNumber(order.trackingNumber ?? "");
    setAdminNote(order.adminNote ?? "");
  }, [open, order]);

  // When admin selects Cancelled, pre-fill the underpayment note
  const handleStatusChange = (value: string) => {
  const status = value as OrderStatus;
  setOrderStatus(status);

  if (status === "cancelled" && !adminNote) {
    setAdminNote("Payment unsuccessful");
  }
};

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!order) return;

    const payload: UpdateOrderPayload = {
      orderStatus,
      trackingNumber: trackingNumber.trim() || null,
    };

    // Only send adminNote when cancelling (or if they typed something)
    if (orderStatus === "cancelled" || adminNote.trim()) {
      payload.adminNote = adminNote.trim() || null;
    }

    updateMutation.mutate(payload);
  };

  const isBusy = updateMutation.isPending;
  const isDelivery = order?.shippingMethod === "delivery";
  const showAdminNote = orderStatus === "cancelled";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isBusy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update order</DialogTitle>
        </DialogHeader>

        <form
          id="order-status-form"
          onSubmit={handleSubmit}
          className="space-y-5 py-2"
        >
          {/* Order status */}
          <div className="space-y-2">
            <Label>Order status</Label>

            <Select
              value={orderStatus}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              {order?.shippingMethod === "pickup"
                ? "Pickup order — statuses include ready for pickup."
                : order?.shippingMethod === "delivery"
                  ? "Delivery order — statuses include shipped and out for delivery."
                  : "Select a status for this order."}
            </p>
          </div>

          {/* Admin note – only when cancelling (underpayment) */}
          {showAdminNote && (
            <div className="space-y-2">
              <Label htmlFor="adminNote">Cancellation reason</Label>

              <Input
                id="adminNote"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Payment unsuccessful"
              />

              <p className="text-xs text-muted-foreground">
                This will be shown to the customer.
              </p>
            </div>
          )}

          {/* Tracking mainly for delivery */}
          {isDelivery && (
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">
                Tracking number
              </Label>

              <Input
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) =>
                  setTrackingNumber(e.target.value)
                }
                placeholder="e.g. TRK-123456789"
              />

              <p className="text-xs text-muted-foreground">
                Optional. Shown to the customer for tracking.
              </p>
            </div>
          )}
        </form>

        <DialogFooter className="flex-col-reverse gap-2 p-[1rem] sm:flex-row sm:justify-end lg:p-[1rem]">
          <Button
            type="button"
            className="w-full sm:w-auto"
            variant="outline"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            form="order-status-form"
            disabled={isBusy}
          >
            {isBusy && (
              <Loader2Icon className="size-4 animate-spin" />
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}