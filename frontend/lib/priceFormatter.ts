/**
 * Formats price in Ghanaian Cedi (GHS)
 * @param price - price stored in the database (in GHS)
 */
export function priceFormatter(price: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}