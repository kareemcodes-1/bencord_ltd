"use client";

import * as React from "react";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  type TopProductData,
} from "@/actions/admin/top-products.actions";

import { EmptyState } from "@/app/components/empty-state";
import { ShoppingBagIcon } from "lucide-react";

interface TopSellingProductsProps {
  initialData: TopProductData[];
}

export function TopSellingProducts({
  initialData,
}: TopSellingProductsProps) {
  const [products] =
    React.useState<TopProductData[]>(
      initialData
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>

        <CardDescription>
          Best performing products by sales
        </CardDescription>
      </CardHeader>

      <CardContent>
        {products.length === 0 ? (
          <EmptyState
             icon={<ShoppingBagIcon />}
            title="No sales yet"
            description="Top selling products will appear here once customers start placing orders."
          />
        ) : (
          <div className="space-y-5">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="flex items-center gap-4"
              >
                {/* Rank */}
                <div className="w-5 shrink-0 text-sm font-medium text-muted-foreground">
                  {index + 1}
                </div>

                {/* Product Image */}
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {product.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {product.sales.toLocaleString()}{" "}
                    {product.sales === 1
                      ? "sale"
                      : "sales"}
                  </p>
                </div>

                {/* Revenue */}
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    ₦
                    {product.revenue.toLocaleString()}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {product.orders.toLocaleString()}{" "}
                    {product.orders === 1
                      ? "order"
                      : "orders"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}