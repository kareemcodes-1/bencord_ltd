"use client";

import { useMemo } from "react";
import { State } from "country-state-city";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type DeliveryData = {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type SavedAddress = {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type Props = {
  data: DeliveryData;
  onChange: (field: keyof DeliveryData, value: string) => void;
  savedAddresses: SavedAddress[];
  selectedAddressId: string | "new";
  onSelectAddress: (id: string | "new") => void;
};

export default function DeliverySection({
  data,
  onChange,
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
}: Props) {
  // Only Ghana states/regions
  const states = useMemo(() => State.getStatesOfCountry("GH"), []);

  const showForm = selectedAddressId === "new" || savedAddresses.length === 0;

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <h2 className="mb-5 text-[1.1rem] font-medium sm:mb-6 sm:text-[1.2rem]">
        Delivery address
      </h2>

      {/* ===== Saved Addresses ===== */}
      {savedAddresses.length > 0 && (
        <RadioGroup
          value={selectedAddressId}
          onValueChange={(value) => onSelectAddress(value as string | "new")}
          className="mb-5 space-y-3 sm:mb-6"
        >
          {savedAddresses.map((addr) => (
            <label
              key={addr._id}
              htmlFor={addr._id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors sm:p-4 ${selectedAddressId === addr._id
                  ? "border-[#ee0a0a] bg-[#ee0a0a]/5"
                  : "border-black/10 hover:border-black/20"
                }`}
            >
              <RadioGroupItem
                value={addr._id}
                id={addr._id}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">
                    {addr.firstName} {addr.lastName}
                  </p>
                  {addr.isDefault && (
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-black/60">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-black/60">
                  {addr.address}
                  {addr.apartment ? `, ${addr.apartment}` : ""}
                </p>
                <p className="text-sm text-black/60">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-black/60">
                  <Image
                    src="https://flagcdn.com/w20/gh.png"
                    alt="Ghana"
                    width={18}
                    height={13}
                    className="rounded-[2px]"
                  />
                  Ghana
                </p>
              </div>
            </label>
          ))}

          {/* Use a new address */}
          <label
            htmlFor="new-address"
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors sm:p-4 ${selectedAddressId === "new"
                ? "border-[#ee0a0a] bg-[#ee0a0a]/5"
                : "border-black/10 hover:border-black/20"
              }`}
          >
            <RadioGroupItem value="new" id="new-address" />
            <span className="text-sm font-medium">Use a new address</span>
          </label>
        </RadioGroup>
      )}

      {/* ===== New Address Form ===== */}
      {showForm && (
        <div className="space-y-4 sm:space-y-5">
          {/* Country - Fixed to Ghana */}
          <div className="space-y-2">
            <Label className="text-[0.7rem] uppercase tracking-[0.05em] font-medium text-black/80">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-[0.7rem] uppercase tracking-[0.05em] font-medium text-black/80"
              >
                First name
              </Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                className="h-11 rounded-xl border-black/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-[0.7rem] uppercase tracking-[0.05em] font-medium text-black/80"
              >
                Last name
              </Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                className="h-11 rounded-xl border-black/10"
                required
              />
            </div>
          </div>

          {/* Street address */}
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-[0.7rem] uppercase tracking-[0.05em] font-medium text-black/80"
            >
              Address
            </Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => onChange("address", e.target.value)}
              className="h-11 rounded-xl border-black/10"
              required
            />
          </div>

          {/* Apartment */}
          <div className="space-y-2">
            <Label
              htmlFor="apartment"
              className="text-[0.7rem] uppercase tracking-[0.05em] font-medium text-black/80"
            >
              Apartment, suite, etc. (optional)
            </Label>
            <Input
              id="apartment"
              value={data.apartment}
              onChange={(e) => onChange("apartment", e.target.value)}
              className="h-11 rounded-xl border-black/10"
            />
          </div>

          {/* City + Region + Postal */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="text-[0.7rem] uppercase tracking-[0.05em] font-medium text-black/80"
              >
                City
              </Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => onChange("city", e.target.value)}
                className="h-11 rounded-xl border-black/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[0.7rem] uppercase tracking-[0.05em] font-medium text-black/80">
                Region
              </Label>
              <Select
                value={data.state || undefined}
                onValueChange={(value) => onChange("state", value)}
              >
                <SelectTrigger className="!h-11 !rounded-xl border-black/10">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="max-h-60 z-[350]">
                  {states.map((s) => (
                    <SelectItem key={s.isoCode} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="postalCode"
                className="text-[0.7rem] uppercase tracking-[0.05em] font-medium text-black/80"
              >
                Postal code
              </Label>
              <Input
                id="postalCode"
                value={data.postalCode}
                onChange={(e) => onChange("postalCode", e.target.value)}
                className="h-11 rounded-xl border-black/10"
                required
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}