"use client";

import * as React from "react";

import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { getProducts, deleteProduct } from "@/actions/admin/product.actions";

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
  PackageIcon,
  StarIcon,
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

import Image from "next/image";

import type { Product } from "@/types";

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

interface ProductsTableProps {
  onEdit?: (product: Product) => void;
}

const features = tableFeatures({
  columnVisibilityFeature,
});

const columnHelper = createColumnHelper<typeof features, Product>();

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getStockStatus(product: Product) {
  if (product.inStock) {
    return {
      label: "In stock",
      className:
        "border-green-200 bg-green-100 text-green-700 hover:bg-green-100",
    };
  }

  return {
    label: "Out of stock",
    className:
      "border-red-200 bg-red-100 text-red-700 hover:bg-red-100",
  };
}

function ProductsTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Search & Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:max-w-sm" />
        <Skeleton className="h-10 w-full sm:w-[200px]" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex min-w-[220px] items-center gap-3">
                        <Skeleton className="size-11 rounded-md" />

                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-20" />
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

export function ProductsTable({ onEdit }: ProductsTableProps) {
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Delete confirmation state
  const [productToDelete, setProductToDelete] =
    React.useState<Product | null>(null);

  const limit = 10;

  /*
   * Debounce search
   */
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  /*
   * Fetch products
   */
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      "products",
      {
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      },
    ],
    queryFn: () =>
      getProducts({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      }),
    placeholderData: keepPreviousData,
  });

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  /*
   * Delete mutation
   */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      setProductToDelete(null);
    },
  });

  /*
   * Reset to page 1 when sorting changes
   */
  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");

    setSortBy(field);
    setSortOrder(order as "asc" | "desc");
    setPage(1);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;

    deleteMutation.mutate(productToDelete._id);
  };

  /*
   * Table columns
   */
  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        /* Product */
        columnHelper.accessor("name", {
          header: "Product",

          cell: ({ row }) => {
            const product = row.original;

            const image = product.media?.find(
              (item) => item.type === "image"
            );

            return (
              <div className="flex min-w-[220px] items-center gap-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-md border bg-muted">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <PackageIcon className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {product.name}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {product.slug}
                  </p>
                </div>
              </div>
            );
          },
        }),

        /* Price */
        columnHelper.accessor("price", {
          header: "Price",

          cell: ({ row }) => (
            <span className="font-medium tabular-nums">
              {priceFormatter(row.original.price)}
            </span>
          ),
        }),

        /* Availability */
        columnHelper.display({
          id: "availability",
          header: "Availability",

          cell: ({ row }) => {
            const status = getStockStatus(row.original);

            return (
              <Badge className={status.className}>
                {status.label}
              </Badge>
            );
          },
        }),

        /* Rating */
        columnHelper.display({
          id: "rating",
          header: "Rating",

          cell: ({ row }) => {
            const product = row.original;

            return (
              <div className="flex items-center gap-1.5">
                <StarIcon className="size-4 fill-yellow-400 text-yellow-400" />

                <span className="tabular-nums">
                  {product.averageRating.toFixed(1)}
                </span>

                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              </div>
            );
          },
        }),

        /* Created */
        columnHelper.accessor("createdAt", {
          header: "Created",

          cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
              {formatDate(row.original.createdAt)}
            </span>
          ),
        }),

        /* Actions */
        columnHelper.display({
          id: "actions",
          header: "",

          cell: ({ row }) => {
            const product = row.original;

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
                        Open product actions
                      </span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit?.(product)}
                    >
                      <PencilIcon />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        setProductToDelete(product)
                      }
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
    [onEdit]
  );

  const table = useTable({
    features,
    data: products,
    columns,
  });

  /*
   * Initial loading
   */
  if (isLoading) {
    return <ProductsTableSkeleton />;
  }

  /*
   * Error
   */
  if (isError) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center p-6">
          <p className="text-sm text-destructive">
            Failed to load products.
          </p>
        </CardContent>
      </Card>
    );
  }

  /*
   * Empty state
   */
  if (!pagination?.total && !debouncedSearch) {
    return (
      <EmptyState
        icon={<PackageIcon />}
        title="No products yet"
        description="Create your first product to start managing your store inventory."
        action={
          <Button>
            <PackageIcon />
            Create Product
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products..."
            className="pl-9"
          />
        </div>

        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort products" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="createdAt-desc">
              Newest
            </SelectItem>

            <SelectItem value="createdAt-asc">
              Oldest
            </SelectItem>

            <SelectItem value="name-asc">
              Name A-Z
            </SelectItem>

            <SelectItem value="name-desc">
              Name Z-A
            </SelectItem>

            <SelectItem value="price-asc">
              Price: Low to High
            </SelectItem>

            <SelectItem value="price-desc">
              Price: High to Low
            </SelectItem>

            <SelectItem value="averageRating-desc">
              Rating: Highest
            </SelectItem>

            <SelectItem value="averageRating-asc">
              Rating: Lowest
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
                          <table.FlexRender
                            header={header}
                          />
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
                          <table.FlexRender
                            cell={cell}
                          />
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
                      No products found.
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
                    {products.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {pagination.total}
                  </span>{" "}
                  products
                </>
              ) : (
                "No products"
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
                  isFetching ||
                  !pagination?.hasPreviousPage
                }
                onClick={() =>
                  setPage((current) => current - 1)
                }
              >
                <ChevronLeftIcon />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  isFetching ||
                  !pagination?.hasNextPage
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete product?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {productToDelete?.name}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
            >
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