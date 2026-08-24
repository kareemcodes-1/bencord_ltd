// components/checkout/checkout-form.tsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { priceFormatter } from "@/lib/priceFormatter";

import { Skeleton } from "@/components/ui/skeleton";

import ContactSection from "./contact-section";
import DeliverySection, {
  type DeliveryData,
  type SavedAddress,
} from "./delivery-section";
import ShippingMethodSection from "./shipping-method";
import PaymentSection from "./payment-section";
import OrderSummary from "./order-summary";
import EmptyState from "@/app/components/empty-state";
import { ShoppingBag } from "lucide-react";

type UserData = {
  email: string;
  phone: string;
  name?: string;
  addresses: SavedAddress[];
};

type Props = {
  user: UserData;
};

const DOOR_DELIVERY_FEE = 2000;

export default function CheckoutForm({ user }: Props) {
  const { items, _hasHydrated } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);

  const [contact, setContact] = useState({
    email: user.email || "",
    phone: user.phone || "",
  });

 const [delivery, setDelivery] = useState<DeliveryData>({
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  postalCode: "",
  country: "GH", // ← always Ghana
});

  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    "new"
  );

  const [shippingMethod, setShippingMethod] = useState<"pickup" | "delivery">(
    "pickup"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select default address
  useEffect(() => {
    if (user.addresses.length === 0) {
      setSelectedAddressId("new");
      setDelivery((prev) => ({
        ...prev,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        country: "GH",
      }));
      return;
    }

    const defaultAddr =
      user.addresses.find((a) => a.isDefault) || user.addresses[0];

    setSelectedAddressId(defaultAddr._id);
    setDelivery({
      firstName: defaultAddr.firstName,
      lastName: defaultAddr.lastName,
      address: defaultAddr.address,
      apartment: defaultAddr.apartment || "",
      city: defaultAddr.city,
      state: defaultAddr.state,
      postalCode: defaultAddr.postalCode,
      country: defaultAddr.country,
    });
  }, [user.addresses, user.name]);

  const handleSelectAddress = (id: string | "new") => {
    setSelectedAddressId(id);

    if (id === "new") {
  setDelivery({
    firstName: user.name?.split(" ")[0] || "",
    lastName: user.name?.split(" ").slice(1).join(" ") || "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "GH", // ← always Ghana
  });
  return;
}

    const addr = user.addresses.find((a) => a._id === id);
    if (!addr) return;

    setDelivery({
      firstName: addr.firstName,
      lastName: addr.lastName,
      address: addr.address,
      apartment: addr.apartment || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
  };

  const shippingFee = shippingMethod === "delivery" ? DOOR_DELIVERY_FEE : 0;

  const handleContactChange = (
    field: keyof typeof contact,
    value: string
  ) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeliveryChange = (
    field: keyof DeliveryData,
    value: string
  ) => {
    setDelivery((prev) => ({ ...prev, [field]: value }));
  };

  

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (items.length === 0) {
    toast.error("Your cart is empty.");
    return;
  }

  if (!contact.email || !contact.phone) {
    toast.error("Please fill in your contact details.");
    return;
  }

  if (
    !delivery.firstName ||
    !delivery.lastName ||
    !delivery.address ||
    !delivery.city ||
    !delivery.country ||
    !delivery.postalCode
  ) {
    toast.error("Please complete your delivery address.");
    return;
  }

  setIsSubmitting(true);

  try {
    // Base amounts (what is stored in the cart)
    const subtotalBase = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingFeeBase = shippingMethod === "delivery" ? DOOR_DELIVERY_FEE : 0;
    const totalAmountBase = subtotalBase + shippingFeeBase;

    const res = await fetch("/api/flutterwave/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact,
        delivery,
        shippingMethod,
        shippingFee: shippingFeeBase,
        selectedAddressId,
        items,
        subtotal: subtotalBase,
        totalAmount: totalAmountBase,   // still base currency
        currency,                       // ← important: current selected currency
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Failed to initialize payment");
      return;
    }

    window.location.href = data.authorization_url;
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  // 1. Wait for cart to rehydrate
  if (!_hasHydrated) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:gap-12">
        {/* Left side skeletons */}
        <div className="space-y-5 sm:space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Right side skeleton */}
        <div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // 2. Only show empty state after hydration is complete
 if (items.length === 0) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center py-20">
      <EmptyState
        icon={ShoppingBag}
        message="No items in your cart"
        buttonText="Back to Home"
        buttonHref="/"
      />
    </div>
  );
}

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:gap-12">
        {/* Left side */}
        <div className="space-y-5 sm:space-y-6">
          <ContactSection data={contact} onChange={handleContactChange} />

          <DeliverySection
            data={delivery}
            onChange={handleDeliveryChange}
            savedAddresses={user.addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={handleSelectAddress}
          />

          <ShippingMethodSection
            method={shippingMethod}
            onChange={setShippingMethod}
            shippingFee={DOOR_DELIVERY_FEE}
            priceFormatter={priceFormatter}
          />

          <PaymentSection />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Pay now"}
          </button>
        </div>

        {/* Right side */}
        <div>
          <OrderSummary shippingFee={shippingFee} />
        </div>
      </div>
    </form>
  );
}