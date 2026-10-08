"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  type TrafficSourceData,
} from "@/actions/admin/traffic-source.actions";

interface TrafficSourcesProps {
  initialData: TrafficSourceData[];
}

export function TrafficSources({
  initialData,
}: TrafficSourcesProps) {
  const [data] =
    React.useState<TrafficSourceData[]>(
      initialData
    );

  const totalSessions = data.reduce(
    (total, item) => total + item.sessions,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>

        <CardDescription>
          Where your website visitors are coming from
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          {data.map((item) => {
            const percentage =
              totalSessions > 0
                ? (item.sessions / totalSessions) * 100
                : 0;

            return (
              <div
                key={item.source}
                className="space-y-2"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium">
                    {item.source}
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
      </CardContent>
    </Card>
  );
}