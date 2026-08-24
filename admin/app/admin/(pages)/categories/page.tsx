"use client";

import * as React from "react";

import { PageHeader } from "@/app/components/page-header";
import { CategoriesTable } from "@/app/components/categories/categories-table";
import { CategoryDialog } from "@/app/components/categories/category-dialog";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

import type { Category } from "@/types";

export default function CategoriesPage() {
    const [dialogOpen, setDialogOpen] =
        React.useState(false);

    const [editingCategory, setEditingCategory] =
        React.useState<Category | null>(null);

    const handleCreate = () => {
        setEditingCategory(null);
        setDialogOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setDialogOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setDialogOpen(open);

        if (!open) {
            setEditingCategory(null);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-6">
                <PageHeader
                    title="Categories"
                    description="Manage your categories and organize your products."
                    action={
                        <Button
                            size="lg"
                            onClick={handleCreate}
                        >
                            <PlusIcon />
                            Create Category
                        </Button>
                    }
                />

                <CategoriesTable onEdit={handleEdit} />

                <CategoryDialog
                    open={dialogOpen}
                    onOpenChange={handleOpenChange}
                    category={editingCategory}
                />
            </div>
        </main>
    );
}