"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { priceFormatter } from "@/lib/priceFormatter";

import {
  ShoppingCartIcon,
  BanknoteIcon,
  UsersIcon,
  PercentIcon,
} from "lucide-react";

interface SectionCardsProps {
  totalOrders?: number;
  revenue?: number;
}

export function SectionCards({
  totalOrders = 0,
  revenue = 0,
}: SectionCardsProps) {
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [deliveredOrders, setDeliveredOrders] = useState(0);

  useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const [visitorsResponse, conversionResponse] = await Promise.all([
        fetch("/api/admin/analytics/visitors"),
        fetch("/api/admin/analytics/conversion"),
      ]);

      if (!visitorsResponse.ok || !conversionResponse.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const visitorsData = await visitorsResponse.json();
      const conversionData = await conversionResponse.json();

      setTotalVisitors(visitorsData.totalVisitors || 0);
      setDeliveredOrders(conversionData.deliveredOrders || 0);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  fetchAnalytics();
}, []);

  const conversionRate =
  totalVisitors > 0
    ? (deliveredOrders / totalVisitors) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {/* Revenue */}
      <Card>
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            {priceFormatter(revenue)}
          </CardTitle>

          <CardAction>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 sm:size-11">
              <BanknoteIcon className="size-5 text-primary sm:size-6" />
            </div>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            Total revenue generated
          </div>

          <div className="text-muted-foreground">
            From completed orders
          </div>
        </CardFooter>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardDescription>Total Orders</CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            {totalOrders.toLocaleString()}
          </CardTitle>

          <CardAction>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 sm:size-11">
              <ShoppingCartIcon className="size-5 text-primary sm:size-6" />
            </div>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            Orders placed
          </div>

          <div className="text-muted-foreground">
            All orders on the store
          </div>
        </CardFooter>
      </Card>

      {/* Visitors */}
      <Card>
        <CardHeader>
          <CardDescription>Total Visitors</CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            {totalVisitors.toLocaleString()}
          </CardTitle>

          <CardAction>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 sm:size-11">
              <UsersIcon className="size-5 text-primary sm:size-6" />
            </div>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            Website visitors
          </div>

          <div className="text-muted-foreground">
            Active users in the last 30 days
          </div>
        </CardFooter>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardHeader>
          <CardDescription>Conversion Rate</CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            {conversionRate.toFixed(2)}%
          </CardTitle>

          <CardAction>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 sm:size-11">
              <PercentIcon className="size-5 text-primary sm:size-6" />
            </div>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            Visitor to order conversion
          </div>

          <div className="text-muted-foreground">
            Based on the last 30 days
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}