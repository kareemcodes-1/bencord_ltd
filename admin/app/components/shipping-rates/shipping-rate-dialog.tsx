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
import { Switch } from "@/components/ui/switch";

import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";

import type { ShippingRate } from "@/types";
import {
  createShippingRate,
  updateShippingRate,
  type ShippingRatePayload,
} from "@/actions/admin/shipping-rates.action"

interface ShippingRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rate?: ShippingRate | null;
}

export function ShippingRateDialog({
  open,
  onOpenChange,
  rate,
}: ShippingRateDialogProps) {
  const isEditing = !!rate;
  const queryClient = useQueryClient();

  const [location, setLocation] = React.useState("");
  const [fee, setFee] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createShippingRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-rates"] });
      toast.success("Shipping rate created");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create shipping rate"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ShippingRatePayload) =>
      updateShippingRate(rate!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-rates"] });
      toast.success("Shipping rate updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update shipping rate"
      );
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    if (!open) return;

    if (rate) {
      setLocation(rate.location);
      setFee(String(rate.fee));
      setIsActive(rate.isActive);
    } else {
      setLocation("");
      setFee("");
      setIsActive(true);
    }

    setFormError(null);
  }, [open, rate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!location.trim()) {
      setFormError("Location is required");
      return;
    }

    if (fee === "" || Number(fee) < 0) {
      setFormError("Please enter a valid fee");
      return;
    }

    const payload: ShippingRatePayload = {
      location: location.trim(),
      fee: Number(fee),
      isActive,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSaving) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit shipping rate" : "Add shipping rate"}
          </DialogTitle>
        </DialogHeader>

        <form id="shipping-rate-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Accra, Kumasi, Tema"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee">Delivery Fee</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                GHS
              </span>
              <Input
                id="fee"
                type="number"
                min="0"
                step="0.01"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0.00"
                required
                className="pl-12"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">
                {isActive
                  ? "Customers can select this location"
                  : "This location is hidden from customers"}
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}
        </form>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button type="submit" form="shipping-rate-form" disabled={isSaving}>
            {isSaving && <Loader2Icon className="size-4 animate-spin" />}
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Add location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}