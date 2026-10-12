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
import { Loader2, ShoppingBag } from "lucide-react";

import {
  getPublicShippingRates,
  type PublicShippingRate,
} from "@/actions/shipping-rates"; // adjust path if needed

type UserData = {
  email: string;
  phone: string;
  name?: string;
  addresses: SavedAddress[];
};

type Props = {
  user: UserData;
};

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
    country: "GH",
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    "new"
  );

  const [shippingMethod, setShippingMethod] = useState<"pickup" | "delivery">(
    "pickup"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== Shipping Rates =====
  const [shippingRates, setShippingRates] = useState<PublicShippingRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      try {
        const rates = await getPublicShippingRates();
        setShippingRates(rates);
      } catch (error) {
        console.error("Failed to load shipping rates:", error);
        toast.error("Failed to load delivery fees");
      } finally {
        setLoadingRates(false);
      }
    };

    loadRates();
  }, []);

  // Match selected region with admin shipping rates
  const matchedRate = shippingRates.find(
    (rate) =>
      rate.location.toLowerCase().trim() ===
      delivery.state.toLowerCase().trim()
  );

  const shippingFee =
    shippingMethod === "delivery" ? matchedRate?.fee ?? 0 : 0;

  const isDeliveryAvailable =
    shippingMethod === "pickup" || Boolean(matchedRate);

  // ===== Load user addresses =====
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
      user.addresses.find((address) => address.isDefault) ||
      user.addresses[0];

    setSelectedAddressId(defaultAddr._id);

    setDelivery({
      firstName: defaultAddr.firstName,
      lastName: defaultAddr.lastName,
      address: defaultAddr.address,
      apartment: defaultAddr.apartment || "",
      city: defaultAddr.city,
      state: defaultAddr.state,
      postalCode: defaultAddr.postalCode,
      country: defaultAddr.country || "GH",
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
        country: "GH",
      });
      return;
    }

    const address = user.addresses.find((item) => item._id === id);
    if (!address) return;

    setDelivery({
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      apartment: address.apartment || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "GH",
    });
  };

  const handleContactChange = (
    field: keyof typeof contact,
    value: string
  ) => {
    setContact((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeliveryChange = (
    field: keyof DeliveryData,
    value: string
  ) => {
    setDelivery((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!contact.email.trim() || !contact.phone.trim()) {
      toast.error("Please fill in your contact details.");
      return;
    }

    if (
      !delivery.firstName.trim() ||
      !delivery.lastName.trim() ||
      !delivery.address.trim() ||
      !delivery.city.trim() ||
      !delivery.state.trim() ||
      !delivery.country ||
      !delivery.postalCode.trim()
    ) {
      toast.error("Please complete your delivery address.");
      return;
    }

    if (shippingMethod === "delivery" && !matchedRate) {
      toast.error(
        "Door delivery is not available for the selected region. Please choose another region or select Pickup."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const subtotalBase = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const totalAmountBase = subtotalBase + shippingFee;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact,
          delivery,
          shippingMethod,
          shippingFee,
          selectedAddressId,
          items,
          subtotal: subtotalBase,
          totalAmount: totalAmountBase,
          currency,
          paymentMethod: "bank_transfer",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to place your order.");
        return;
      }

      if (!data.orderId) {
        toast.error("Order was created but no order ID was returned.");
        return;
      }

      window.location.href = `/checkout/payment?orderId=${encodeURIComponent(
        data.orderId
      )}`;
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!_hasHydrated || loadingRates) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:gap-12">
        <div className="space-y-5 sm:space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        <div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

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
        <div className="space-y-5 sm:space-y-6">
          <ContactSection
            data={contact}
            onChange={handleContactChange}
          />

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
            shippingFee={shippingFee}
            priceFormatter={priceFormatter}
            isDeliveryAvailable={isDeliveryAvailable}
            matchedLocation={matchedRate?.location}
          />

          <PaymentSection />

          <button
            type="submit"
            disabled={
              isSubmitting ||
              (shippingMethod === "delivery" && !matchedRate)
            }
            className="btn-primary w-full disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 inline-block size-4 animate-spin" />
              </>
            ) : (
              "Pay now"
            )}
          </button>
        </div>

        <div>
          <OrderSummary shippingFee={shippingFee} />
        </div>
      </div>
    </form>
  );
}