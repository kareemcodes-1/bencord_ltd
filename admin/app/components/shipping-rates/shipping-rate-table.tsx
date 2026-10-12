
"use client";

import * as React from "react";
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getShippingRates,
  deleteShippingRate,
} from "@/actions/admin/shipping-rates.action";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/app/components/empty-state";

import {
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  MapPinIcon,
} from "lucide-react";

import type { ShippingRate } from "@/types";
import toast from "react-hot-toast";

interface ShippingRatesTableProps {
  onEdit?: (rate: ShippingRate) => void;
}

const features = tableFeatures({
  columnVisibilityFeature,
});

const columnHelper = createColumnHelper<typeof features, ShippingRate>();

const ghanaCurrencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatGhanaCedis(amount: number) {
  return ghanaCurrencyFormatter.format(amount);
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function ShippingRatesTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full sm:max-w-sm" />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delivery Location</TableHead>
                  <TableHead>Delivery Fee (GHS)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
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

export function ShippingRatesTable({
  onEdit,
}: ShippingRatesTableProps) {
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [rateToDelete, setRateToDelete] =
    React.useState<ShippingRate | null>(null);

  const limit = 10;

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      "shipping-rates",
      { page, limit, search: debouncedSearch },
    ],
    queryFn: () =>
      getShippingRates({
        page,
        limit,
        search: debouncedSearch,
      }),
    placeholderData: keepPreviousData,
  });

  const rates = data?.rates ?? [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShippingRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shipping-rates"],
      });
      setRateToDelete(null);
      toast.success("Shipping location deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete shipping location"
      );
    },
  });

  const handleConfirmDelete = () => {
    if (!rateToDelete) return;
    deleteMutation.mutate(rateToDelete._id);
  };

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("location", {
          header: "Delivery Location",
          cell: ({ row }) => (
            <div className="flex items-center gap-2 font-medium">
              <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>{row.original.location}</span>
            </div>
          ),
        }),

        columnHelper.accessor("fee", {
          header: "Delivery Fee (GHS)",
          cell: ({ row }) => (
            <span className="font-medium tabular-nums">
              {formatGhanaCedis(row.original.fee)}
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
                    : "border-red-200 bg-red-100 text-red-700 hover:bg-red-100"
                }
              >
                {active ? "Active" : "Inactive"}
              </Badge>
            );
          },
        }),

        columnHelper.accessor("createdAt", {
          header: "Created",
          cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
              {row.original.createdAt
                ? formatDate(row.original.createdAt)
                : "—"}
            </span>
          ),
        }),

        columnHelper.display({
          id: "actions",
          header: "",
          cell: ({ row }) => {
            const rate = row.original;

            return (
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                    >
                      <MoreHorizontalIcon />
                      <span className="sr-only">
                        Open actions
                      </span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit?.(rate)}
                    >
                      <PencilIcon />
                      Edit location
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setRateToDelete(rate)}
                    >
                      <Trash2Icon />
                      Delete location
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          },
        }),
      ]),
    [onEdit]
  );

  const table = useTable({
    features,
    data: rates,
    columns,
  });

  if (isLoading) {
    return <ShippingRatesTableSkeleton />;
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center p-6">
          <p className="text-sm text-destructive">
            Failed to load Ghana shipping rates. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!pagination?.total && !debouncedSearch) {
    return (
      <EmptyState
        icon={<MapPinIcon />}
        title="No Ghana delivery locations yet"
        description="Add Ghana regions and cities with their delivery fees so customers can choose the correct delivery location at checkout."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search Ghana delivery locations..."
          className="pl-9"
        />
      </div>

      {/* Rates table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : (
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
                      className={
                        isFetching ? "opacity-60" : undefined
                      }
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
                      className="h-32 text-center text-muted-foreground"
                    >
                      No matching delivery locations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {pagination ? (
                <>
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {rates.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {pagination.total}
                  </span>{" "}
                  delivery locations
                </>
              ) : (
                "No delivery locations"
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
                disabled={
                  isFetching || !pagination?.hasPreviousPage
                }
                onClick={() => setPage((current) => current - 1)}
              >
                <ChevronLeftIcon />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  isFetching || !pagination?.hasNextPage
                }
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!rateToDelete}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setRateToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete delivery location?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {rateToDelete?.location}
              </span>
              {" "}and its shipping rate. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
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
                "Delete location"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}