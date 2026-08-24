import { Button, Heading, Section, Text } from "@react-email/components";
import EmailLayout from "./email-layout";

type Props = {
  title: string;
  description: string;
  discountLabel: string; // e.g. "20% OFF" or "₦5,000 OFF"
  expiresAt?: string; // formatted date
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://loisbanksbeauty.com";

export default function NewDiscountEmail({
  title,
  description,
  discountLabel,
  expiresAt,
}: Props) {
  return (
    <EmailLayout preview={`${discountLabel} — ${title}`}>
      <Text className="m-0 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#ee0a0a]">
        Special offer
      </Text>

      <Heading className="mt-3 mb-0 text-center text-[26px] font-medium leading-tight text-black">
        {title}
      </Heading>

      <Text className="mt-4 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        {description}
      </Text>

      {/* Discount badge */}
      <Section className="mt-8 text-center">
        <Text className="m-0 inline-block rounded-full bg-[#ee0a0a] px-6 py-3 text-[18px] font-medium tracking-wide text-white">
          {discountLabel}
        </Text>
      </Section>

      {expiresAt && (
        <Text className="mt-5 mb-0 text-center text-[13px] text-black/45">
          Offer ends {expiresAt}
        </Text>
      )}

      <Text className="mt-6 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        Shop selected products and enjoy this exclusive deal while it lasts.
      </Text>

      <Section className="mt-8 text-center">
        <Button
          href={`${APP_URL}/shop`}
          className="rounded-full bg-[#ee0a0a] px-8 py-3.5 text-[13px] font-medium uppercase tracking-[0.08em] text-white no-underline"
        >
          Shop the offer
        </Button>
      </Section>
    </EmailLayout>
  );
}