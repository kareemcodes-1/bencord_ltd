"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { ProfileAddress } from "@/actions/profile.actions";
import AddressSheet from "./address-sheet";
import EmptyState from "@/app/components/empty-state";
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

type Props = {
  addresses: ProfileAddress[];
};

export default function AddressList({ addresses: initial }: Props) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initial);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ProfileAddress | null>(null);
  const [addressToDelete, setAddressToDelete] =
    useState<ProfileAddress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (address: ProfileAddress) => {
    setEditing(address);
    setSheetOpen(true);
  };

  const handleEdit = (address: ProfileAddress) => {
    setEditing(address);
    setSheetOpen(true);
  }

  const handleDelete = async () => {
    if (!addressToDelete) return;

    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/profile/addresses/${addressToDelete._id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete.");
        return;
      }

      toast.success("Address deleted.");
      setAddresses((prev) =>
        prev.filter((a) => a._id !== addressToDelete._id)
      );
      setAddressToDelete(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaved = (address: ProfileAddress, mode: "create" | "edit") => {
    if (mode === "create") {
      setAddresses((prev) => {
        const next = address.isDefault
          ? prev.map((a) => ({ ...a, isDefault: false }))
          : prev;
        return [...next, address];
      });
    } else {
      setAddresses((prev) =>
        prev.map((a) => {
          if (a._id === address._id) return address;
          if (address.isDefault) return { ...a, isDefault: false };
          return a;
        })
      );
    }
    router.refresh();
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <div>
          <h2 className="text-[1.1rem] font-medium sm:text-[1.2rem]">
            Shipping addresses
          </h2>

          <h3 className="mt-1 text-sm font-bold font-black text-2xl  font-medium">
            {addresses.length} address
          </h3>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/15 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.08em] transition-colors hover:border-black hover:bg-black hover:text-white sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[0.75rem]"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          message="No addresses yet."
          buttonText="Add address"
          onButtonClick={openCreate}
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="rounded-xl border border-black/10 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-black">
                    {addr.firstName} {addr.lastName}
                  </p>
                  {addr.isDefault && (
                    <span className="mt-1 inline-block rounded-full bg-[#ee0a0a]/10 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.08em] text-[#ee0a0a]">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(addr)}
                    className="rounded-full p-2 text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                    aria-label="Edit address"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressToDelete(addr)}
                    className="rounded-full p-2 text-black/40 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete address"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-black/60">
                {addr.address}
                {addr.apartment ? `, ${addr.apartment}` : ""}
                <br />
                {addr.city}, {addr.state} {addr.postalCode}
                <br />
                {addr.country}
              </p>
            </div>
          ))}
        </div>
      )}

      <AddressSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        address={editing}
        onSaved={handleSaved}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!addressToDelete}
        onOpenChange={(open) => {
          if (!open) setAddressToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete address?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address
              {addressToDelete
                ? ` for ${addressToDelete.firstName} ${addressToDelete.lastName}`
                : ""}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}