"use client";

import * as React from "react";

import { PageHeader } from "@/app/components/page-header";
import { ProductsTable } from "@/app/components/products/products-table";
import { ProductDialog } from "@/app/components/products/product-dialog";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

import type { Product } from "@/types";

export default function ProductsPage() {
    const [dialogOpen, setDialogOpen] =
        React.useState(false);

    const [editingProduct, setEditingProduct] =
        React.useState<Product | null>(null);

    const handleCreate = () => {
        setEditingProduct(null);
        setDialogOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setDialogOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setEditingProduct(null);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-6">
                <PageHeader
                    title="Products"
                    description="Manage your products, inventory, and product information."
                    action={
                        <Button
                            size="lg"
                            onClick={handleCreate}
                        >
                            <PlusIcon />
                            Create Product
                        </Button>
                    }
                />

                <ProductsTable onEdit={handleEdit} />

                <ProductDialog
                    open={dialogOpen}
                    onOpenChange={handleOpenChange}
                    product={editingProduct}
                />
            </div>
        </main>
    );
}