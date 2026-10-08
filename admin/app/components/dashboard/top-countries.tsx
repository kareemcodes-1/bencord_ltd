"use client";

import * as React from "react";
import { Globe2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  type TopCountryData,
} from "@/actions/admin/top-countries.actions";
import { EmptyState } from "../empty-state";

interface TopCountriesProps {
  initialData: TopCountryData[];
}

export function TopCountries({
  initialData,
}: TopCountriesProps) {
  const [data] =
    React.useState<TopCountryData[]>(initialData);

  const totalSessions = data.reduce(
    (total, item) => total + item.sessions,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Countries</CardTitle>

        <CardDescription>
          Countries driving the most website traffic
        </CardDescription>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={<Globe2 className="size-5" />}
            title="No country data yet"
            description="Once visitors start exploring your website, their countries will appear here."
          />
        ) : (
          <div className="space-y-5">
            {data.map((item) => {
              const percentage =
                totalSessions > 0
                  ? (item.sessions / totalSessions) * 100
                  : 0;

              return (
                <div
                  key={item.country}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">
                      {item.country}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium tabular-nums">
                        {item.sessions.toLocaleString()}
                      </span>

                      <span className="text-xs text-muted-foreground tabular-nums">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

