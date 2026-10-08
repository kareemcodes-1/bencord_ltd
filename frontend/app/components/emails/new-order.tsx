import {
  Column,
  Hr,
  Link,
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
  dashboardUrl?: string;
};

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
      style={{ wordBreak: "break-word" }}
    >
      {children}
    </Text>
  );
}

export default function NewOrderEmail({
  orderId,
  customerName,
  customerEmail,
  items,
  totalAmount,
  shippingMethod,
  dashboardUrl,
}: Props) {
  return (
    <EmailLayout
      preview={`New order #${orderId} from ${customerName}`}
    >
      <EmailEyebrow>New order</EmailEyebrow>

      <EmailHeading>You have a new order</EmailHeading>

      <EmailText center>
        {customerName} just placed an order on the Bencord Ltd website.
      </EmailText>

      {/* Order details */}
      <EmailCard>
        <Label>Order</Label>
        <Value>#{orderId}</Value>

        <Label>Customer</Label>
        <Value>
          {customerName}
          <br />
          <Link
            href={`mailto:${customerEmail}`}
            className="text-[14px] font-normal text-[#ee0a0a] no-underline"
          >
            {customerEmail}
          </Link>
        </Value>

        <Label>Fulfilment</Label>

        <Text className="m-0 mt-1 text-[15px] font-medium text-black">
          {shippingMethod === "pickup"
            ? "Store pickup"
            : "Delivery"}
        </Text>
      </EmailCard>

      {/* Items */}
      <Section className="my-6">
        <Label>Items ordered</Label>

        {items.map((item, index) => (
          <Section key={`${item.name}-${index}`}>
            <Row className="mt-3">
              <Column className="align-top">
                <Text
                  className="m-0 text-[15px] font-medium leading-[1.4] text-black"
                  style={{ wordBreak: "break-word" }}
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
                <Text className="m-0 text-[15px] font-medium text-black">
                  {priceFormatter(item.price * item.quantity)}
                </Text>
              </Column>
            </Row>

            <Hr className="mx-0 mb-0 mt-3 border-0 border-t border-solid border-black/10" />
          </Section>
        ))}

        {/* Total */}
        <Row className="mt-4">
          <Column className="align-middle">
            <Text className="m-0 text-[13px] font-medium uppercase tracking-[0.08em] text-black/60">
              Total
            </Text>
          </Column>

          <Column
            className="whitespace-nowrap pl-3 text-right align-middle"
            style={{ width: "1%" }}
          >
            <Text className="m-0 text-[20px] font-semibold text-black">
              {priceFormatter(totalAmount)}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Dashboard action */}
      {dashboardUrl ? (
        <EmailButton href={dashboardUrl}>
          View order
        </EmailButton>
      ) : (
        <Text className="m-0 text-center text-[13px] leading-[1.6] text-black/50">
          Open the admin dashboard to review and confirm this order.
        </Text>
      )}
    </EmailLayout>
  );
}