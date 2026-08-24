"use client";

import * as React from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react";

import type { Product } from "@/types";
import { getCategories } from "@/actions/admin/category.actions";
import {
  createProduct,
  updateProduct,
  type ProductPayload,
} from "@/actions/admin/product.actions";
import toast from "react-hot-toast";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

/**
 * A media item in the uploader.
 * - "existing" items already live on ImageKit (loaded from `product.media`).
 * - "new" items are local files picked by the user; they only get uploaded
 *   to ImageKit when the form is submitted.
 */
type MediaItem =
  | {
      id: string;
      kind: "existing";
      url: string;
      type: "image" | "video";
    }
  | {
      id: string;
      kind: "new";
      file: File;
      previewUrl: string;
      type: "image" | "video";
    };

const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

async function uploadToImageKit(
  file: File
): Promise<{ url: string; type: "image" | "video" }> {
  if (!IMAGEKIT_PUBLIC_KEY) {
    throw new Error(
      "ImageKit is not configured. Set NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY."
    );
  }

  // 1. Get authentication parameters from your backend
  const authRes = await fetch("/api/imagekit-auth");
  if (!authRes.ok) {
    throw new Error("Failed to get ImageKit authentication");
  }

  const { signature, expire, token } = await authRes.json();

  // 2. Upload the file
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", IMAGEKIT_PUBLIC_KEY);
  formData.append("signature", signature);
  formData.append("expire", String(expire));
  formData.append("token", token);

  const response = await fetch(
    "https://upload.imagekit.io/api/v1/files/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload file to ImageKit");
  }

  const data = await response.json();

  return {
    url: data.url as string,
    type: file.type.startsWith("video") ? "video" : "image",
  };
}

function createId() {
  return Math.random().toString(36).slice(2);
}

function resolveCategoryId(categoryId: Product["categoryId"]) {
  if (!categoryId) return "";

  if (typeof categoryId === "string") {
    return categoryId;
  }

  return String((categoryId as { _id: string })._id ?? "");
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
}: ProductDialogProps) {
  const isEditing = !!product;

  const queryClient = useQueryClient();

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");

  const [trackInventory, setTrackInventory] = React.useState(true);

  const [stock, setStock] = React.useState("0");
  const [lowStockThreshold, setLowStockThreshold] = React.useState("5");

  const [featured, setFeatured] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);

  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const { data, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const categories = data?.categories ?? [];

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      toast.success("Product created");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create product"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductPayload) =>
      updateProduct(product!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      toast.success("Product updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update product"
      );
    },
  });

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;

    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description);
      setPrice(String(product.price));
      setCategoryId(resolveCategoryId(product.categoryId));

      setTrackInventory(product.trackInventory);
      setStock(String(product.stock));
      setLowStockThreshold(String(product.lowStockThreshold));

      setFeatured(product.featured);
      setIsActive(product.isActive);

      setMedia(
        (product.media ?? []).map((item) => ({
          id: createId(),
          kind: "existing" as const,
          url: item.url,
          type: item.type,
        }))
      );
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setPrice("");
      setCategoryId("");

      setTrackInventory(true);
      setStock("0");
      setLowStockThreshold("5");

      setFeatured(false);
      setIsActive(true);

      setMedia([]);
    }

    setFormError(null);
  }, [open, product]);

  // Revoke local object URLs so we don't leak memory once the dialog
  // closes or a file is removed.
  React.useEffect(() => {
    return () => {
      media.forEach((item) => {
        if (item.kind === "new") {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFilesSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newItems: MediaItem[] = Array.from(files).map((file) => ({
      id: createId(),
      kind: "new" as const,
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video")
        ? ("video" as const)
        : ("image" as const),
    }));

    setMedia((current) => [...current, ...newItems]);

    // allow selecting the same file again later
    event.target.value = "";
  };

  const handleRemoveMedia = (id: string) => {
    setMedia((current) => {
      const item = current.find((m) => m.id === id);

      if (item?.kind === "new") {
        URL.revokeObjectURL(item.previewUrl);
      }

      return current.filter((m) => m.id !== id);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setFormError(null);
    setIsUploading(true);

    try {
      // Existing media is already on ImageKit — pass it through.
      // New media only gets uploaded now, at submit time.
      const uploadedMedia = await Promise.all(
        media.map(async (item) => {
          if (item.kind === "existing") {
            return {
              url: item.url,
              type: item.type,
            };
          }

          return uploadToImageKit(item.file);
        })
      );

      setIsUploading(false);

      const payload: ProductPayload = {
        name,
        slug,
        description,
        price: Number(price),
        categoryId,

        trackInventory,
        stock: Number(stock),
        lowStockThreshold: Number(lowStockThreshold),

        featured,
        isActive,

        media: uploadedMedia,
      };

      if (isEditing) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      onOpenChange(false);
    } catch (error) {
      setIsUploading(false);

      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving this product."
      );
    }
  };

  const isBusy = isUploading || isSaving;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isBusy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isEditing ? "Edit product" : "Create product"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-6 overflow-y-auto px-6 py-6"
        >
          <div className="space-y-2">
            <Label>Media</Label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed py-6 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/30 disabled:pointer-events-none disabled:opacity-60"
            >
              <ImagePlusIcon className="size-5" />
              <span>Click to upload images or videos</span>
            </button>

            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {media.map((item) => {
                  const src =
                    item.kind === "existing"
                      ? item.url
                      : item.previewUrl;

                  return (
                    <div
                      key={item.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                    >
                      {item.type === "video" ? (
                        <video
                          src={src}
                          muted
                          className="size-full object-cover"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt=""
                          className="size-full object-cover"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(item.id)}
                        disabled={isBusy}
                        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black disabled:pointer-events-none"
                      >
                        <XIcon className="size-3.5" />
                        <span className="sr-only">Remove file</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="product-slug"
              required
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>

              <SelectContent>
                {isLoadingCategories ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem
                      key={category._id}
                      value={String(category._id)}
                    >
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    No categories found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe your product..."
              className="min-h-28 resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                GHS
              </span>

              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
                required
                className="pl-12"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
            <Label>Track inventory</Label>
            <Switch
              checked={trackInventory}
              onCheckedChange={setTrackInventory}
            />
          </div>

          {trackInventory && (
            <>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Low stock threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={lowStockThreshold}
                  onChange={(event) =>
                    setLowStockThreshold(event.target.value)
                  }
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
            <Label>Featured product</Label>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
            <Label>Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </form>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end p-[1rem] lg:p-[1rem]">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="product-form"
            className="w-full sm:w-auto"
            size="lg"
            disabled={isBusy}
          >
            {isBusy && (
              <Loader2Icon className="size-4 animate-spin" />
            )}

            {isUploading
              ? "Uploading..."
              : isSaving
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}