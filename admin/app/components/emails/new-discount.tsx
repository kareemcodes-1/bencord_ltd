import { Link, Text } from "@react-email/components";

import EmailLayout, {
  EmailButton,
  EmailCard,
  EmailEyebrow,
  EmailHeading,
  EmailText,
} from "./email-layout";

type Props = {
  title: string;
  description?: string;
  discountLabel: string; // e.g. "20% OFF" or "₦5,000 OFF"
  expiresAt?: string; // formatted date
  productCount?: number;
  unsubscribeUrl: string;
};

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "https://bencordltd.com.ng";


export default function NewDiscountEmail({
  title,
  description,
  discountLabel,
  expiresAt,
  productCount,
  unsubscribeUrl,
}: Props) {
  const details = [
    typeof productCount === "number" && productCount > 0
      ? `${productCount} product${productCount === 1 ? "" : "s"}`
      : null,
    expiresAt ? `Ends ${expiresAt}` : null,
  ].filter(Boolean);

  return (
    <EmailLayout preview={`${discountLabel}: ${title}`}>
      <EmailEyebrow>Special offer</EmailEyebrow>

      <EmailHeading>A new discount is available</EmailHeading>

      <EmailText center>
        We just added a new offer at Bencord Ltd.
      </EmailText>

      {/* Offer card */}
      <EmailCard>
        <Text
          className="m-0 text-center text-[36px] font-normal leading-[1.1] tracking-[-0.02em] text-[#ee0a0a] sm:text-[44px]"
        >
          {discountLabel}
        </Text>

        <Text
          className="m-0 mt-3 text-center text-[17px] font-medium leading-[1.4] text-black"
          style={{ wordBreak: "break-word" }}
        >
          {title}
        </Text>

        {description ? (
          <Text
            className="m-0 mt-2 text-center text-[14px] leading-[1.6] text-black/60"
            style={{ wordBreak: "break-word" }}
          >
            {description}
          </Text>
        ) : null}

        {details.length > 0 ? (
          <Text className="m-0 mt-4 text-center text-[12px] uppercase tracking-[0.08em] text-black/45">
            {details.join("  ·  ")}
          </Text>
        ) : null}
      </EmailCard>

      <EmailButton href={`${FRONTEND_URL}/shop`}>
        Shop the offer
      </EmailButton>

      <Text className="m-0 mt-6 text-center text-[11px] leading-[1.6] text-black/40">
        You&apos;re receiving this because you subscribed to Bencord Ltd
        updates.
        <br />
        <Link
          href={unsubscribeUrl}
          className="text-black/50 underline"
        >
          Unsubscribe
        </Link>
      </Text>
    </EmailLayout>
  );
}