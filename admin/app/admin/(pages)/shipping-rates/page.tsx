"use client";

import * as React from "react";

import { PageHeader } from "@/app/components/page-header";
import { ShippingRatesTable } from "@/app/components/shipping-rates/shipping-rate-table";
import { ShippingRateDialog } from "@/app/components/shipping-rates/shipping-rate-dialog";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

import type { ShippingRate } from "@/types";

export default function ShippingRatesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingRate, setEditingRate] =
    React.useState<ShippingRate | null>(null);

  const handleCreate = () => {
    setEditingRate(null);
    setDialogOpen(true);
  };

  const handleEdit = (rate: ShippingRate) => {
    setEditingRate(rate);
    setDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingRate(null);
    }
  };

  return (
    <main className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <PageHeader
          title="Shipping Rates"
          description="Manage delivery locations and fees for door delivery."
          action={
            <Button size="lg" onClick={handleCreate}>
              <PlusIcon />
              Add Location
            </Button>
          }
        />

        <ShippingRatesTable onEdit={handleEdit} />

        <ShippingRateDialog
          open={dialogOpen}
          onOpenChange={handleOpenChange}
          rate={editingRate}
        />
      </div>
    </main>
  );
}