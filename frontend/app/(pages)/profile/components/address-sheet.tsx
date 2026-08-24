"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { State } from "country-state-city";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProfileAddress } from "@/actions/profile.actions";
import Image from "next/image";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: ProfileAddress | null;
  onSaved: (address: ProfileAddress, mode: "create" | "edit") => void;
};

const emptyForm = {
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  postalCode: "",
  country: "GH", // Always Ghana
  isDefault: false,
};

export default function AddressSheet({
  open,
  onOpenChange,
  address,
  onSaved,
}: Props) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(address);

  // Only Ghana states
  const states = useMemo(() => State.getStatesOfCountry("GH"), []);

  useEffect(() => {
    if (open) {
      setForm(
        address
          ? {
            firstName: address.firstName,
            lastName: address.lastName,
            address: address.address,
            apartment: address.apartment ?? "",
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: "GH", // Force Ghana
            isDefault: address.isDefault,
          }
          : emptyForm
      );
    }
  }, [open, address]);

  const setField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEdit
        ? `/api/profile/addresses/${address!._id}`
        : "/api/profile/addresses";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          country: "GH", // Always send Ghana
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save address.");
        return;
      }

      toast.success(data.message || "Address saved.");
      onSaved(data.address, isEdit ? "edit" : "create");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="z-[350] flex w-full max-w-[32rem] flex-col gap-0 border-none bg-white p-0 [&>button]:hidden"
      >
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b px-6 py-5">
          <SheetTitle className="heading-3 text-left">
            {isEdit ? "Edit address" : "Add address"}
          </SheetTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-[#ee0a0a] hover:text-white"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {/* Country - Fixed to Ghana */}
            {/* Country - Fixed to Ghana */}
            <div className="space-y-2">
              <Label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                Country
              </Label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-neutral-50 px-3 text-sm text-black/70">
                <Image
                  src="https://flagcdn.com/w20/gh.png"
                  alt="Ghana"
                  width={18}
                  height={13}
                  className="rounded-[2px]"
                />
                Ghana
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                  First name
                </Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  className="h-11 rounded-xl border-black/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                  Last name
                </Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  className="h-11 rounded-xl border-black/10"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                Address
              </Label>
              <Input
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                className="h-11 rounded-xl border-black/10"
                required
              />
            </div>

            {/* Apartment */}
            <div className="space-y-2">
              <Label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                Apartment{" "}
                <span className="text-black/40">(optional)</span>
              </Label>
              <Input
                value={form.apartment}
                onChange={(e) => setField("apartment", e.target.value)}
                className="h-11 rounded-xl border-black/10"
              />
            </div>

            {/* City + Region */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                  City
                </Label>
                <Input
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="h-11 rounded-xl border-black/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                  Region
                </Label>
                <Select
                  value={form.state || undefined}
                  onValueChange={(value) => setField("state", value)}
                >
                  <SelectTrigger className="!h-11 w-full !rounded-xl border-black/10">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent className="z-[350] max-h-60">
                    {states.map((s) => (
                      <SelectItem key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Postal code */}
            <div className="space-y-2">
              <Label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                Postal code
              </Label>
              <Input
                value={form.postalCode}
                onChange={(e) => setField("postalCode", e.target.value)}
                className="h-11 rounded-xl border-black/10"
                required
              />
            </div>

            {/* Default checkbox */}
            <label className="flex cursor-pointer items-center gap-3 pt-2">
              <Checkbox
                checked={form.isDefault}
                onCheckedChange={(checked) =>
                  setField("isDefault", checked === true)
                }
                className="border-black/25 data-[state=checked]:border-[#ee0a0a] data-[state=checked]:bg-[#ee0a0a]"
              />
              <span className="text-sm font-medium text-black/70">
                Set as default address
              </span>
            </label>
          </div>

          <div className="border-t border-black/10 px-6 py-5">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update address"
                  : "Save address"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}