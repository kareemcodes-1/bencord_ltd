import { Button, Heading, Section, Text } from "@react-email/components";
import EmailLayout from "./email-layout";

type Props = {
  name: string;
  orderReference: string;
  trackingUrl?: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://loisbanksbeauty.com";

export default function OrderShippedEmail({
  name,
  orderReference,
  trackingUrl,
}: Props) {
  return (
    <EmailLayout preview={`Your order #${orderReference} is on the way`}>
      <Text className="m-0 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#ee0a0a]">
        On the way
      </Text>

      <Heading className="mt-3 mb-0 text-center text-[26px] font-medium leading-tight text-black">
        Your order has shipped
      </Heading>

      <Text className="mt-4 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        Hi {name}, good news — your order is on its way to you.
      </Text>

      <Section className="mt-8 rounded-2xl bg-[#fafafa] px-5 py-4 text-center">
        <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
          Order reference
        </Text>
        <Text className="mt-1 mb-0 font-mono text-[15px] font-medium tracking-wide text-black">
          {orderReference}
        </Text>
      </Section>

      <Text className="mt-8 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        We’re carefully packing and moving your items through delivery. You’ll
        get another update when it arrives.
      </Text>

      <Section className="mt-8 text-center">
        {trackingUrl ? (
          <Button
            href={trackingUrl}
            className="rounded-full bg-[#ee0a0a] px-8 py-3.5 text-[13px] font-medium uppercase tracking-[0.08em] text-white no-underline"
          >
            Track package
          </Button>
        ) : (
          <Button
            href={`${APP_URL}/orders`}
            className="rounded-full bg-[#ee0a0a] px-8 py-3.5 text-[13px] font-medium uppercase tracking-[0.08em] text-white no-underline"
          >
            View order
          </Button>
        )}
      </Section>

      <Text className="mt-6 mb-0 text-center text-[13px] text-black/40">
        Questions?{" "}
        <a href={`${APP_URL}/contact`} className="font-medium text-black underline">
          Contact us
        </a>
      </Text>
    </EmailLayout>
  );
}