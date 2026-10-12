"use client";

import * as React from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { State } from "country-state-city";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";

import type { ShippingRate } from "@/types";
import {
  createShippingRate,
  updateShippingRate,
  type ShippingRatePayload,
} from "@/actions/admin/shipping-rates.action";

interface ShippingRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rate?: ShippingRate | null;
}

const GHANA_CODE = "GH";

export function ShippingRateDialog({
  open,
  onOpenChange,
  rate,
}: ShippingRateDialogProps) {
  const isEditing = !!rate;
  const queryClient = useQueryClient();

  const [regionCode, setRegionCode] = React.useState("");
  const [fee, setFee] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Ghana regions only.
  const regions = React.useMemo(
    () => State.getStatesOfCountry(GHANA_CODE),
    []
  );

  const selectedRegion = regions.find(
    (region) => region.isoCode === regionCode
  );

  const createMutation = useMutation({
    mutationFn: createShippingRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-rates"] });
      toast.success("Shipping rate created");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create shipping rate"
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
        error instanceof Error
          ? error.message
          : "Failed to update shipping rate"
      );
    },
  });

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    if (!open) return;

    if (rate) {
      setFee(String(rate.fee));
      setIsActive(rate.isActive);

      // New format: "Region". Older rates may be "City, Region",
      // so we also try the last part after the final comma.
      const location = rate.location.trim();
      const lastPart = location.split(",").pop()?.trim() ?? "";

      const matchingRegion = regions.find((region) => {
        const name = region.name.toLowerCase();
        return (
          name === location.toLowerCase() ||
          name === lastPart.toLowerCase()
        );
      });

      setRegionCode(matchingRegion?.isoCode ?? "");
    } else {
      setRegionCode("");
      setFee("");
      setIsActive(true);
    }

    setFormError(null);
  }, [open, rate, regions]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!regionCode || !selectedRegion) {
      setFormError("Please select a Ghana region");
      return;
    }

    if (
      fee.trim() === "" ||
      !Number.isFinite(Number(fee)) ||
      Number(fee) < 0
    ) {
      setFormError("Please enter a valid delivery fee");
      return;
    }

    const payload: ShippingRatePayload = {
      location: selectedRegion.name,
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
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isEditing ? "Edit shipping rate" : "Add shipping rate"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="shipping-rate-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-6 overflow-y-auto px-6 py-6"
        >
          {/* Country is fixed to Ghana */}
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value="Ghana" readOnly />
            <p className="text-xs text-muted-foreground">
              Delivery rates are available for Ghana only.
            </p>
          </div>

          {/* Ghana region */}
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select value={regionCode} onValueChange={setRegionCode}>
              <SelectTrigger id="region" className="w-full">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {regions.map((region) => (
                  <SelectItem key={region.isoCode} value={region.isoCode}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The selected region identifies this delivery rate.
            </p>
          </div>

          {/* Delivery fee */}
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
                onChange={(event) => setFee(event.target.value)}
                placeholder="0.00"
                required
                className="pl-12"
              />
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">
                {isActive
                  ? "Customers can select this region"
                  : "This region is hidden from customers"}
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}
        </form>

        <DialogFooter className="shrink-0 flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="shipping-rate-form"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isSaving}
          >
            {isSaving && <Loader2Icon className="size-4 animate-spin" />}
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Add rate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}