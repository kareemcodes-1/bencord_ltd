"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getOrders,
  deleteOrder,
} from "@/actions/admin/order.actions";

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
  PencilIcon,
  Trash2Icon,
  EyeIcon,
  PackageIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
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

import type { Order } from "@/types";

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
import { priceFormatter } from "@/lib/priceFormatter";

interface OrdersTableProps {
  onEdit?: (order: Order) => void;
}

const features = tableFeatures({
  columnVisibilityFeature,
});

const columnHelper = createColumnHelper<typeof features, Order>();


function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Pending",
      className:
        "border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100",
    },

    confirmed: {
      label: "Confirmed",
      className:
        "border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
    },

    shipped: {
      label: "Shipped",
      className:
        "border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100",
    },

    out_for_delivery: {
      label: "Out for delivery",
      className:
        "border-purple-200 bg-purple-100 text-purple-700 hover:bg-purple-100",
    },

    ready_for_pickup: {
      label: "Ready for pickup",
      className:
        "border-green-200 bg-green-100 text-green-700 hover:bg-green-100",
    },

    delivered: {
      label: "Delivered",
      className:
        "border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
    },

    cancelled: {
      label: "Cancelled",
      className:
        "border-red-200 bg-red-100 text-red-700 hover:bg-red-100",
    },
  };

  return (
    map[status] ?? {
      label: status,
      className: "border-border bg-muted text-muted-foreground",
    }
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-full sm:w-[160px]" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto size-8 rounded-md" />
                    </TableCell>
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

export function OrdersTable({ onEdit }: OrdersTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = React.useState("");

  const [orderToDelete, setOrderToDelete] =
    React.useState<Order | null>(null);

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
      "orders",
      {
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
        status: statusFilter,
      },
    ],
    queryFn: () =>
      getOrders({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
        status: statusFilter,
      }),
    placeholderData: keepPreviousData,
  });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setOrderToDelete(null);
    },
  });

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order as "asc" | "desc");
    setPage(1);
  };

  const handleConfirmDelete = () => {
    if (!orderToDelete) return;
    deleteMutation.mutate(orderToDelete._id);
  };

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("_id", {
          header: "Order",
          cell: ({ row }) => (
            <span className="font-mono text-xs">
              #{String(row.original._id).slice(-8).toUpperCase()}
            </span>
          ),
        }),

        columnHelper.display({
          id: "customer",
          header: "Customer",
          cell: ({ row }) => {
            const addr = row.original.shippingAddress;
            return (
              <div className="min-w-[140px]">
                <p className="truncate font-medium">
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {addr.city}, {addr.country}
                </p>
              </div>
            );
          },
        }),

        columnHelper.display({
          id: "shippingMethod",
          header: "Method",
          cell: ({ row }) => {
            const method = row.original.shippingMethod;
            return (
              <span className="text-sm text-muted-foreground">
                {method === "pickup" ? "Pickup" : "Delivery"}
              </span>
            );
          },
        }),

    columnHelper.accessor("totalAmount", {
  header: "Total",
  cell: ({ row }) => {
    const order = row.original;

    const discountTitles = Array.from(
      new Set(
        (order.items || [])
          .filter(
            (item) =>
              item.discount &&
              typeof item.originalPrice === "number" &&
              item.originalPrice > item.price
          )
          .map((item) => item.discount?.title)
          .filter((title): title is string => Boolean(title))
      )
    );

    const hasDiscount = discountTitles.length > 0 ||
      order.items?.some(
        (item) =>
          item.discount &&
          typeof item.originalPrice === "number" &&
          item.originalPrice > item.price
      );

    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium tabular-nums">
          {priceFormatter(order.totalAmount)}
        </span>

        {hasDiscount && (
          <span className="max-w-[140px] truncate text-[11px] font-medium text-[#FD3F92]">
            Discount applied
            {discountTitles.length > 0
              ? ` · ${discountTitles.join(", ")}`
              : ""}
          </span>
        )}
      </div>
    );
  },
}),

        columnHelper.accessor("orderStatus", {
          header: "Status",
          cell: ({ row }) => {
            const status = getStatusBadge(row.original.orderStatus);
            return (
              <Badge className={status.className}>{status.label}</Badge>
            );
          },
        }),

        columnHelper.accessor("createdAt", {
          header: "Date",
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
            const order = row.original;

            return (
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                      <span className="sr-only">Open order actions</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/admin/orders/${order._id}`)
                      }
                    >
                      <EyeIcon />
                      View
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => onEdit?.(order)}>
                      <PencilIcon />
                      Update
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setOrderToDelete(order)}
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
    [onEdit, router]
  );

  const table = useTable({
    features,
    data: orders,
    columns,
  });

  if (isLoading) return <OrdersTableSkeleton />;

  if (isError) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center p-6">
          <p className="text-sm text-destructive">Failed to load orders.</p>
        </CardContent>
      </Card>
    );
  }

  if (!pagination?.total && !debouncedSearch && !statusFilter) {
    return (
      <EmptyState
        icon={<PackageIcon />}
        title="No orders yet"
        description="Orders will appear here once customers start purchasing."
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
            placeholder="Search orders..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All orders
              </SelectItem>

              <SelectItem value="pending">
                Pending
              </SelectItem>

              <SelectItem value="confirmed">
                Confirmed
              </SelectItem>

              <SelectItem value="shipped">
                Shipped
              </SelectItem>

              <SelectItem value="out_for_delivery">
                Out for delivery
              </SelectItem>

              <SelectItem value="ready_for_pickup">
                Ready for pickup
              </SelectItem>

              <SelectItem value="delivered">
                Delivered
              </SelectItem>

              <SelectItem value="cancelled">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest</SelectItem>
              <SelectItem value="createdAt-asc">Oldest</SelectItem>
              <SelectItem value="totalAmount-desc">Highest total</SelectItem>
              <SelectItem value="totalAmount-asc">Lowest total</SelectItem>
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
                      No orders found.
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
                    {orders.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {pagination.total}
                  </span>{" "}
                  orders
                </>
              ) : (
                "No orders"
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
        open={!!orderToDelete}
        onOpenChange={(open) => {
          if (!open) setOrderToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete order{" "}
              <span className="font-mono font-medium text-foreground">
                #
                {orderToDelete
                  ? String(orderToDelete._id).slice(-8).toUpperCase()
                  : ""}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmDelete}
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