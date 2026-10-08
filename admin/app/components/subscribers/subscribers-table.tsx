"use client";

import * as React from "react";

import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getSubscribers,
  updateSubscriberStatus,
  deleteSubscriber,
} from "@/actions/admin/subscriber.actions";

import {
  columnVisibilityFeature,
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  MoreHorizontalIcon,
  Trash2Icon,
  MailIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/app/components/empty-state";

import type { Subscriber } from "@/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import toast from "react-hot-toast";

const features = tableFeatures({
  columnVisibilityFeature,
});

const columnHelper = createColumnHelper<typeof features, Subscriber>();

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function SubscribersTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="ml-auto size-8 rounded-md" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SubscribersTable() {
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [status, setStatus] = React.useState<"all" | "active" | "inactive">("all");

  const [subscriberToDelete, setSubscriberToDelete] =
    React.useState<Subscriber | null>(null);

  const limit = 10;

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      "subscribers",
      { page, limit, search: debouncedSearch, sortBy, sortOrder, status },
    ],
    queryFn: () =>
      getSubscribers({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
        status,
      }),
    placeholderData: keepPreviousData,
  });

  const subscribers = data?.subscribers ?? [];
  const pagination = data?.pagination;

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateSubscriberStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      toast.success(
        variables.isActive ? "Subscriber activated" : "Subscriber deactivated"
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update subscriber"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      setSubscriberToDelete(null);
      toast.success("Subscriber deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete subscriber"
      );
    },
  });

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order as "asc" | "desc");
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatus(value as "all" | "active" | "inactive");
    setPage(1);
  };

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("email", {
          header: "Email",
          cell: ({ row }) => (
            <span className="font-medium">{row.original.email}</span>
          ),
        }),

        columnHelper.accessor("source", {
          header: "Source",
          cell: ({ row }) => (
            <span className="text-sm capitalize text-muted-foreground">
              {row.original.source || "—"}
            </span>
          ),
        }),

        columnHelper.display({
          id: "status",
          header: "Status",
          cell: ({ row }) => {
            const active = row.original.isActive;
            return (
              <Badge
                className={
                  active
                    ? "border-green-200 bg-green-100 text-green-700 hover:bg-green-100"
                    : "border-border bg-muted text-muted-foreground"
                }
              >
                {active ? "Active" : "Inactive"}
              </Badge>
            );
          },
        }),

        columnHelper.accessor("createdAt", {
          header: "Subscribed",
          cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
              {formatDate(row.original.createdAt)}
            </span>
          ),
        }),

        columnHelper.display({
          id: "actions",
          header: "",
          cell: ({ row }) => {
            const subscriber = row.original;

            return (
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                      <span className="sr-only">Open actions</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    {subscriber.isActive ? (
                      <DropdownMenuItem
                        onClick={() =>
                          statusMutation.mutate({
                            id: subscriber._id,
                            isActive: false,
                          })
                        }
                      >
                        <UserXIcon />
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() =>
                          statusMutation.mutate({
                            id: subscriber._id,
                            isActive: true,
                          })
                        }
                      >
                        <UserCheckIcon />
                        Activate
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setSubscriberToDelete(subscriber)}
                    >
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          },
        }),
      ]),
    [statusMutation]
  );

  const table = useTable({
    features,
    data: subscribers,
    columns,
  });

  if (isLoading) {
    return <SubscribersTableSkeleton />;
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center p-6">
          <p className="text-sm text-destructive">
            Failed to load subscribers.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!pagination?.total && !debouncedSearch && status === "all") {
    return (
      <EmptyState
        icon={<MailIcon />}
        title="No subscribers yet"
        description="When people subscribe from the website, they’ll appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={status} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest</SelectItem>
              <SelectItem value="createdAt-asc">Oldest</SelectItem>
              <SelectItem value="email-asc">Email A-Z</SelectItem>
              <SelectItem value="email-desc">Email Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={isFetching ? "opacity-60" : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      No subscribers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {pagination ? (
                <>
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {subscribers.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {pagination.total}
                  </span>{" "}
                  subscribers
                </>
              ) : (
                "No subscribers"
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="mr-2 text-sm text-muted-foreground">
                Page {pagination?.page ?? page} of{" "}
                {pagination?.totalPages ?? 1}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={isFetching || !pagination?.hasPreviousPage}
                onClick={() => setPage((c) => c - 1)}
              >
                <ChevronLeftIcon />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isFetching || !pagination?.hasNextPage}
                onClick={() => setPage((c) => c + 1)}
              >
                Next
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!subscriberToDelete}
        onOpenChange={(open) => {
          if (!open) setSubscriberToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {subscriberToDelete?.email}
              </span>{" "}
              from your list. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                if (subscriberToDelete) {
                  deleteMutation.mutate(subscriberToDelete._id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}