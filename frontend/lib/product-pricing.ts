import type { Product } from "@/types";

export function getProductPricing(product: Product) {
  const originalPrice = product.price;
  const discount = product.discount;

  if (!discount) {
    return {
      originalPrice,
      finalPrice: originalPrice,
      hasDiscount: false,
      discountLabel: null as string | null,
    };
  }

  let discountAmount = 0;

  if (discount.discountType === "percentage") {
    discountAmount = (originalPrice * discount.discountValue) / 100;
  } else {
    discountAmount = discount.discountValue;
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const discountLabel =
    discount.discountType === "percentage"
      ? `-${discount.discountValue}%`
      : `-₦${discount.discountValue.toLocaleString()}`;

  return {
    originalPrice,
    finalPrice,
    hasDiscount: true,
    discountLabel,
  };
}