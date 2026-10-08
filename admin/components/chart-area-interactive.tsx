"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import {
  type RevenueChartData,
  type RevenueChartRange,
} from "@/actions/admin/revenue-chart.actions";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  initialData: RevenueChartData[];
}

export function ChartAreaInteractive({
  initialData,
}: ChartAreaInteractiveProps) {
  const [range, setRange] =
    React.useState<RevenueChartRange>("today");

  const [data, setData] =
    React.useState<RevenueChartData[]>(initialData);

  const [loading, setLoading] = React.useState(false);

  const handleRangeChange = async (
    value: RevenueChartRange
  ) => {
    if (!value || value === range) return;

    setRange(value);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/orders/chart?range=${value}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch revenue chart data"
        );
      }

      const result: RevenueChartData[] =
        await response.json();

      setData(result);
    } catch (error) {
      console.error(
        "Failed to load revenue chart:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Revenue</CardTitle>

          <CardDescription>
            Revenue generated over time
          </CardDescription>
        </div>

        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(value) =>
            handleRangeChange(
              value as RevenueChartRange
            )
          }
          variant="outline"
          className="w-fit"
        >
          <ToggleGroupItem value="today">
            Today
          </ToggleGroupItem>

          <ToggleGroupItem value="7days">
            Last 7 days
          </ToggleGroupItem>

          <ToggleGroupItem value="30days">
            Last 30 days
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                if (range === "today") {
                  const [year, month, day, hour] =
                    value.split("-");

                  const date = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                    Number(hour)
                  );

                  return date.toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                    }
                  );
                }

                const date = new Date(
                  `${value}T00:00:00`
                );

                return date.toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  }
                );
              }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    if (range === "today") {
                      const [year, month, day, hour] =
                        value.split("-");

                      const date = new Date(
                        Number(year),
                        Number(month) - 1,
                        Number(day),
                        Number(hour)
                      );

                      return date.toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                      });
                    }

                    return new Date(
                      `${value}T00:00:00`
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />

            <Area
              dataKey="revenue"
              type="natural"
              fill="var(--primary)"
              fillOpacity={0.4}
              stroke="var(--primary)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>

        {loading && (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            Updating chart...
          </div>
        )}
      </CardContent>
    </Card>
  );
}