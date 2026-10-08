import "server-only";

import { render } from "@react-email/render";
import { sendEmail } from "./zeptomail";

import OrderConfirmedEmail from "@/app/components/emails/order-confirmed";
import OrderShippedEmail from "@/app/components/emails/order-shipped";
import OrderReadyForPickupEmail from "@/app/components/emails/order-ready-for-pickup-email";
import OrderDeliveredEmail from "@/app/components/emails/order-delivered-email";
import NewProductEmail from "@/app/components/emails/new-product";
import NewDiscountEmail from "@/app/components/emails/new-discount";
import OrderOutForDeliveryEmail from "@/app/components/emails/order-out-for-delivery-email";

export async function sendOrderConfirmedEmail(
  to: string,
  name: string,
  order: {
    orderReference: string;
    items: {
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }[];
    subtotal: number;
    shippingFee: number;
    tax?: number;
    totalAmount: number;
    paymentMethod: string;
    shippingMethod: "pickup" | "delivery";
  }
) {
  const html = await render(
    <OrderConfirmedEmail
      name={name}
      orderReference={order.orderReference}
      items={order.items}
      subtotal={order.subtotal}
      shippingFee={order.shippingFee}
      tax={order.tax}
      totalAmount={order.totalAmount}
      paymentMethod={order.paymentMethod}
      shippingMethod={order.shippingMethod}
    />
  );

  await sendEmail({
    to,
    subject: `Order confirmed #${order.orderReference}`,
    html,
  });
}

export async function sendOrderShippedEmail(
  to: string,
  name: string,
  orderReference: string,
  trackingUrl?: string
) {
  const html = await render(
    <OrderShippedEmail
      name={name}
      orderReference={orderReference}
      trackingUrl={trackingUrl}
    />
  );
  await sendEmail({
    to,
    subject: `Your order #${orderReference} has shipped`,
    html,
  });
}

export async function sendOrderReadyForPickupEmail(
  to: string,
  name: string,
  orderReference: string
) {
  const html = await render(
    <OrderReadyForPickupEmail name={name} orderReference={orderReference} />
  );
  await sendEmail({
    to,
    subject: `Order #${orderReference} is ready for pickup`,
    html,
  });
}

export async function sendOrderOutForDeliveryEmail(
  to: string,
  name: string,
  orderReference: string
) {
  const html = await render(
    <OrderOutForDeliveryEmail
      name={name}
      orderReference={orderReference}
    />
  );

  await sendEmail({
    to,
    subject: `Your order #${orderReference} is out for delivery`,
    html,
  });
}

export async function sendOrderDeliveredEmail(
  to: string,
  name: string,
  orderReference: string,
  shippingMethod: "pickup" | "delivery"
) {
  const html = await render(
    <OrderDeliveredEmail
      name={name}
      orderReference={orderReference}
      shippingMethod={shippingMethod}
    />
  );

  await sendEmail({
    to,
    subject: `Order #${orderReference} completed`,
    html,
  });
}

export async function sendNewProductEmail(
  to: string,
  props: {
    productName: string;
    productImage?: string;
    productSlug: string;
    price: string;
    originalPrice?: string;
    discountLabel?: string;
    description?: string;
    unsubscribeToken: string;
  }
) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${props.unsubscribeToken}`;

  const html = await render(
    <NewProductEmail
      productName={props.productName}
      productImage={props.productImage}
      productSlug={props.productSlug}
      price={props.price}
      originalPrice={props.originalPrice}
      discountLabel={props.discountLabel}
      description={props.description}
      unsubscribeUrl={unsubscribeUrl}
    />
  );

  await sendEmail({
    to,
    subject: `New drop: ${props.productName}`,
    html,
  });
}

export async function sendNewDiscountEmail(
  to: string,
  props: {
    title: string;
    description?: string;
    discountLabel: string;
    expiresAt?: string;
    productCount?: number;
    unsubscribeToken: string;
  }
) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${props.unsubscribeToken}`;

  const html = await render(
    <NewDiscountEmail
      title={props.title}
      description={props.description}
      discountLabel={props.discountLabel}
      expiresAt={props.expiresAt}
      productCount={props.productCount}
      unsubscribeUrl={unsubscribeUrl}
    />
  );

  await sendEmail({
    to,
    subject: `${props.discountLabel} — ${props.title}`,
    html,
  });
}
