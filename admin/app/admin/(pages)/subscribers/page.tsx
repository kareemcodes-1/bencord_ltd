"use client";

import { PageHeader } from "@/app/components/page-header";
import { SubscribersTable } from "@/app/components/subscribers/subscribers-table";

export default function SubscribersPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <PageHeader
          title="Subscribers"
          description="Users who signed up for email updates and offers."
        />

        <SubscribersTable />
      </div>
    </main>
  );
}