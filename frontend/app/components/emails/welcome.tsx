import { Button, Heading, Section, Text } from "@react-email/components";
import EmailLayout from "./email-layout";

type Props = {
  name: string;
};

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://loisbanksbeauty.com";

export default function WelcomeEmail({ name }: Props) {
  return (
    <EmailLayout preview="Welcome to LoisBanks Beauty">
      <Text className="m-0 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#FD3F92]">
        Welcome
      </Text>

      <Heading className="mt-3 mb-0 text-center text-[26px] font-medium leading-tight text-black">
        Welcome to LoisBanks Beauty
      </Heading>

      <Text className="mt-4 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        Hi {name}, we&apos;re so happy to have you here.
      </Text>

      <Text className="mt-3 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        Discover our latest collections, explore your favorites, and enjoy
        exclusive offers made for our customers.
      </Text>

      <Section className="mt-8 text-center">
        <Button
          href={`${APP_URL}/shop`}
          className="rounded-full bg-[#FD3F92] px-8 py-3.5 text-[13px] font-medium uppercase tracking-[0.08em] text-white no-underline"
        >
          Start Shopping
        </Button>
      </Section>
    </EmailLayout>
  );
}

