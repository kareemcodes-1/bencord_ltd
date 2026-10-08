import {
  Column,
  Hr,
  Img,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

import EmailLayout, {
  EmailButton,
  EmailCard,
  EmailEyebrow,
  EmailHeading,
  EmailText,
} from "./email-layout";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string | null;
};

type Props = {
  name: string;
  orderReference: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax?: number;
  totalAmount: number;
  paymentMethod: string;
  shippingMethod: "pickup" | "delivery";
  currency?: string;
};

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "https://bencordltd.com.ng";


const formatMoney = (amount: number, currency = "GHS") =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);

function Label({ children }: { children: ReactNode }) {
  return (
    <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.12em] text-black/40">
      {children}
    </Text>
  );
}

function Value({ children }: { children: ReactNode }) {
  return (
    <Text
      className="m-0 mb-4 mt-1 text-[15px] font-medium leading-[1.5] text-black"
      style={{
        wordBreak: "break-word",
      }}
    >
      {children}
    </Text>
  );
}

function TotalRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <Row className="mt-2">
      <Column>
        <Text
          className={`m-0 ${
            strong
              ? "text-[15px] font-medium text-black"
              : "text-[14px] text-black/60"
          }`}
        >
          {label}
        </Text>
      </Column>

      <Column
        className="whitespace-nowrap pl-3 text-right"
        style={{ width: "1%" }}
      >
        <Text
          className={`m-0 ${
            strong
              ? "text-[18px] font-semibold text-black"
              : "text-[14px] text-black"
          }`}
        >
          {value}
        </Text>
      </Column>
    </Row>
  );
}

export default function OrderConfirmedEmail({
  name,
  orderReference,
  items,
  subtotal,
  shippingFee,
  tax = 0,
  totalAmount,
  paymentMethod,
  shippingMethod,
  currency = "GHS",
}: Props) {
  const isPickup = shippingMethod === "pickup";

  return (
    <EmailLayout
      preview={`Your order #${orderReference} has been confirmed`}
    >
      <EmailEyebrow>Order confirmed</EmailEyebrow>

      <EmailHeading>Thank you for your order</EmailHeading>

      <EmailText center>
        Hi {name}, your order{" "}
        <strong>#{orderReference}</strong> is confirmed and we&apos;ve
        received your payment.{" "}
        {isPickup
          ? "It will be ready for pickup at our store, and we'll let you know as soon as it is."
          : "We'll prepare it for shipping and let you know once it's on its way."}
      </EmailText>

      {/* Order details */}
      <EmailCard>
        <Label>Order reference</Label>
        <Value>{orderReference}</Value>

        <Label>{isPickup ? "Pickup" : "Delivery"}</Label>
        <Value>
          {isPickup ? "Collect from our store" : "Shipped to you"}
        </Value>

        <Label>Payment method</Label>

        <Text className="m-0 mt-1 text-[15px] font-medium text-black">
          {paymentMethod}
        </Text>
      </EmailCard>

      {/* Items */}
      <Section className="mt-8">
        <Label>Order summary</Label>

        {items.map((item, index) => (
          <Section key={`${item.name}-${index}`}>
            <Row className="mt-4">
              {item.image ? (
                <Column
                  className="pr-3 align-top"
                  style={{ width: "76px" }}
                >
                  <Img
                    src={item.image}
                    width={64}
                    height={64}
                    alt={item.name}
                    className="block rounded-lg"
                  />
                </Column>
              ) : null}

              <Column className="align-top">
                <Text
                  className="m-0 text-[14px] font-medium leading-[1.4] text-black"
                  style={{
                    wordBreak: "break-word",
                  }}
                >
                  {item.name}
                </Text>

                <Text className="m-0 mt-1 text-[13px] text-black/50">
                  Qty {item.quantity}
                  {item.size ? ` · Size ${item.size}` : ""}
                </Text>
              </Column>

              <Column
                className="whitespace-nowrap pl-3 text-right align-top"
                style={{ width: "1%" }}
              >
                <Text className="m-0 text-[14px] font-medium text-black">
                  {formatMoney(
                    item.price * item.quantity,
                    currency
                  )}
                </Text>
              </Column>
            </Row>
          </Section>
        ))}
      </Section>

      <Hr className="mx-0 my-6 border-0 border-t border-solid border-black/10" />

      {/* Totals */}
      <Section>
        <TotalRow
          label="Subtotal"
          value={formatMoney(subtotal, currency)}
        />

        {!isPickup && (
          <TotalRow
            label="Delivery fee"
            value={
              shippingFee > 0
                ? formatMoney(shippingFee, currency)
                : "Free"
            }
          />
        )}

        {tax > 0 && (
          <TotalRow
            label="Tax"
            value={formatMoney(tax, currency)}
          />
        )}

        <Hr className="mx-0 my-4 border-0 border-t border-solid border-black/10" />

        <TotalRow
          label="Total"
          value={formatMoney(totalAmount, currency)}
          strong
        />
      </Section>

      <EmailButton href={`${FRONTEND_URL}/orders`}>
        View order
      </EmailButton>
    </EmailLayout>
  );
}