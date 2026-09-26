import "server-only";

import { render } from "@react-email/render";
import { sendEmail } from "./zeptomail";

import WelcomeEmail from "@/app/components/emails/welcome";
import PasswordResetEmail from "@/app/components/emails/password-reset";
import ContactEnquiryEmail from "@/app/components/emails/contact-enquiry";
import EmailVerificationEmail from "@/app/components/emails/email-verification";

import NewOrderEmail from "@/app/components/emails/new-order";
import { priceFormatter } from "../priceFormatter";

export async function sendWelcomeEmail(to: string, name: string) {
  const html = await render(<WelcomeEmail name={name} />);
  await sendEmail({
    to,
    subject: "Welcome to Bencord Ltd",
    html,
  });
}

export async function sendEmailVerificationEmail(
  to: string,
  name: string,
  code: string
) {
  const html = await render(
    <EmailVerificationEmail
      name={name}
      code={code}
    />
  );

  await sendEmail({
    to,
    subject: `${code} is your verification code`,
    html,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  const html = await render(
    <PasswordResetEmail name={name} resetUrl={resetUrl} />
  );
  await sendEmail({
    to,
    subject: "Reset your password",
    html,
  });
}


export async function sendContactEnquiryEmail(props: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const html = await render(
    <ContactEnquiryEmail
      name={props.name}
      email={props.email}
      subject={props.subject}
      message={props.message}
    />
  );

  const receiver =
    process.env.ADMIN_EMAIL || "bencordinvestmentt@gmail.com";

  await sendEmail({
    to: receiver,
    subject: `New enquiry: ${props.subject}`,
    html,
    replyTo: props.email,
    // If your sendEmail supports reply-to, pass props.email here
  });
}

export async function sendNewOrderEmail(props: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    size?: string | null;
  }[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentChannel?: string | null;
  shippingMethod: "pickup" | "delivery";
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}) {
  const html = await render(
    <NewOrderEmail {...props} />
  );

  const receiver =
    process.env.ADMIN_EMAIL ||
    "bencordinvestmentt@gmail.com";

  await sendEmail({
    to: receiver,
    subject: `New order #${props.orderId} — ${priceFormatter(props.totalAmount)}`,
    html,
  });
}