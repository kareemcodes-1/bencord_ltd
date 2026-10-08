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
  trackingUrl?: string;
};

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "https://bencordltd.com.ng";

export default function OrderShippedEmail({
  name,
  orderReference,
  trackingUrl,
}: Props) {
  return (
    <EmailLayout
      preview={`Your order #${orderReference} has been shipped`}
    >
      <EmailEyebrow>Shipped</EmailEyebrow>

      <EmailHeading>Your order is on the way</EmailHeading>

      <EmailText center>
        Hi {name}, good news: your order{" "}
        <strong>#{orderReference}</strong> has been shipped and is
        heading to your delivery address. We&apos;ll let you know once
        it has been delivered.
      </EmailText>

      {trackingUrl ? (
        <>
          <EmailButton href={trackingUrl}>
            Track package
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
        </>
      ) : (
        <EmailButton href={`${FRONTEND_URL}/orders`}>
          View order
        </EmailButton>
      )}
    </EmailLayout>
  );
}