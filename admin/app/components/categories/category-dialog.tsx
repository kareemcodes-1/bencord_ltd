"use client";

import * as React from "react";

import {
  useMutation,
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react";

import type { Category } from "@/types";
import {
  createCategory,
  updateCategory,
  type CategoryPayload,
} from "@/actions/admin/category.actions";
import toast from "react-hot-toast";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

async function uploadToImageKit(file: File): Promise<string> {
  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new Error(
      "ImageKit is not configured. Set NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT."
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
    throw new Error("Failed to upload image to ImageKit");
  }

  const data = await response.json();
  return data.url as string;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const isEditing = !!category;
  const queryClient = useQueryClient();

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [featured, setFeatured] = React.useState(false);

  // Image state
  const [existingImage, setExistingImage] = React.useState<string | null>(null);
  const [newImageFile, setNewImageFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const [isUploading, setIsUploading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create category"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CategoryPayload) =>
      updateCategory(category!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update category"
      );
    },
  });

  const isSaving =
    createMutation.isPending || updateMutation.isPending;
  const isBusy = isUploading || isSaving;

  // Populate form when dialog opens / category changes
  React.useEffect(() => {
    if (!open) return;

    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setFeatured(category.featured ?? false);
      setExistingImage(category.image ?? null);
      setNewImageFile(null);
      setPreviewUrl(null);
    } else {
      setName("");
      setSlug("");
      setFeatured(false);
      setExistingImage(null);
      setNewImageFile(null);
      setPreviewUrl(null);
    }

    setFormError(null);
  }, [open, category]);

  // Cleanup object URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setNewImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExistingImage(null);

    event.target.value = "";
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setNewImageFile(null);
    setPreviewUrl(null);
    setExistingImage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!existingImage && !newImageFile) {
      setFormError("Please upload an image for the category.");
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = existingImage;

      if (newImageFile) {
        imageUrl = await uploadToImageKit(newImageFile);
      }

      setIsUploading(false);

      const payload: CategoryPayload = {
        name,
        slug,
        image: imageUrl!,
        featured,
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
          : "Something went wrong while saving this category."
      );
    }
  };

  const displayImage = previewUrl || existingImage;

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
            {isEditing ? "Edit category" : "Create category"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="category-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-6 overflow-y-auto px-6 py-6"
        >
          {/* Image */}
          <div className="space-y-2">
            <Label>Image</Label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />

            {displayImage ? (
              <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt=""
                  className="size-full object-cover"
                />

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isBusy}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black disabled:pointer-events-none"
                >
                  <XIcon className="size-4" />
                  <span className="sr-only">Remove image</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed py-10 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/30 disabled:pointer-events-none disabled:opacity-60"
              >
                <ImagePlusIcon className="size-5" />
                <span>Click to upload category image</span>
              </button>
            )}

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Category name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="category-slug"
              required
              className="font-mono text-sm"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
            <Label>Featured category</Label>
            <Switch
              checked={featured}
              onCheckedChange={setFeatured}
            />
          </div>
        </form>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end p-[1rem] lg:p-[1rem]">
          <Button
            type="button"
            className="w-full sm:w-auto"
            variant="outline"
            size="lg"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="category-form"
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
                  : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}