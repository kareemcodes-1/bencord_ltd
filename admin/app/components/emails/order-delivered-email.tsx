import { Link, Text } from "@react-email/components";

import EmailLayout, {
  EmailButton,
  EmailEyebrow,
  EmailHeading,
  EmailText,
} from "./email-layout";

type Props = {
  name: string;
  orderReference: string;
  shippingMethod: "pickup" | "delivery";
};

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "https://bencordltd.com.ng";

export default function OrderDeliveredEmail({
  name,
  orderReference,
  shippingMethod,
}: Props) {
  const isPickup = shippingMethod === "pickup";

  return (
    <EmailLayout
      preview={`Your order #${orderReference} is complete`}
    >
      <EmailEyebrow>Completed</EmailEyebrow>

      <EmailHeading>Your order is complete</EmailHeading>

      <EmailText center>
        Hi {name}, your order{" "}
        <strong>#{orderReference}</strong> has been{" "}
        {isPickup
          ? "collected from our store."
          : "delivered to you."}{" "}
        Thank you for shopping with Bencord Ltd. We hope you love it.
      </EmailText>

      <EmailText center>
        We&apos;d love to hear what you think. Leave a quick review
        when you can.
      </EmailText>

      <EmailButton href={`${FRONTEND_URL}/reviews/pending`}>
        Leave a review
      </EmailButton>

      <Text className="m-0 text-center text-[13px] text-black/50">
        Or{" "}
        <Link
          href={`${FRONTEND_URL}/orders`}
          className="font-medium text-black underline"
        >
          view your order
        </Link>
      </Text>
    </EmailLayout>
  );
}