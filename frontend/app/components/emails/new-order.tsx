import { Heading, Section, Text } from "@react-email/components";
import EmailLayout from "./email-layout";
import { priceFormatter } from "@/lib/priceFormatter";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  size?: string | null;
};

type Props = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  shippingMethod: "pickup" | "delivery";
};

const formatPrice = (amount: number) =>
  `₦${amount.toLocaleString("en-NG")}`;

export default function NewOrderEmail({
  orderId,
  customerName,
  customerEmail,
  items,
  totalAmount,
  shippingMethod,
}: Props) {
  return (
    <EmailLayout preview={`New order #${orderId} received`}>
      <Text className="m-0 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#FD3F92]">
        New order
      </Text>

      <Heading className="mt-3 mb-0 text-center text-[26px] font-medium leading-tight text-black">
        New order received
      </Heading>

      <Text className="mt-4 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        A new order has been successfully placed on the
        LoisBanks Beauty website.
      </Text>

      {/* Order */}
      <Section className="mt-8 rounded-2xl bg-[#fafafa] px-5 py-4">
        <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
          Order
        </Text>

        <Text className="mt-1 mb-0 text-[15px] font-medium text-black">
          #{orderId}
        </Text>
      </Section>

      {/* Customer */}
      <Section className="mt-5 rounded-2xl bg-[#fafafa] px-5 py-4">
        <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
          Customer
        </Text>

        <Text className="mt-1 mb-0 text-[15px] font-medium text-black">
          {customerName}
        </Text>

        <Text className="mt-1 mb-0 text-[14px] text-[#FD3F92]">
          {customerEmail}
        </Text>
      </Section>

      {/* Items */}
      <Section className="mt-5 rounded-2xl bg-[#fafafa] px-5 py-4">
        <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
          Items ordered
        </Text>

        {items.map((item, index) => (
          <Section
            key={`${item.name}-${index}`}
            className="mt-4 border-b border-black/5 pb-4"
          >
            <Text className="m-0 text-[15px] font-medium text-black">
              {item.name}
            </Text>

            <Text className="mt-1 mb-0 text-[13px] text-black/50">
              Quantity: {item.quantity}
              {item.size ? ` · Size: ${item.size}` : ""}
            </Text>

            <Text className="mt-1 mb-0 text-[14px] font-medium text-black">
              {priceFormatter(item.price * item.quantity)}
            </Text>
          </Section>
        ))}

        <Text className="mt-5 mb-0 text-[15px] font-medium text-black">
          Total: {formatPrice(totalAmount)}
        </Text>
      </Section>

      {/* Fulfillment */}
      <Section className="mt-5 rounded-2xl bg-[#fafafa] px-5 py-4">
        <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
          Shipping Method
        </Text>

        <Text className="mt-1 mb-0 text-[15px] font-medium text-black">
          {shippingMethod === "pickup" ? "Store pickup" : "Delivery"}
        </Text>
      </Section>

      <Text className="mt-6 mb-0 text-center text-[13px] leading-relaxed text-black/45">
        Check the admin dashboard for more details and to confirm the
        order.
      </Text>
    </EmailLayout>
  );
}
