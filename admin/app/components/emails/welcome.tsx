import { Button, Heading, Section, Text } from "@react-email/components";
import EmailLayout from "./email-layout";

type Props = {
  name: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://loisbanksbeauty.com";

export default function WelcomeEmail({ name }: Props) {
  return (
    <EmailLayout preview="Welcome to LoisBanks Beauty">
      <Heading className="m-0 text-2xl font-medium text-black">
        Welcome, {name}
      </Heading>

      <Text className="mt-4 text-[15px] leading-relaxed text-black/70">
        Thank you for joining LoisBanks Beauty. We&apos;re excited to have you
        here.
      </Text>

      <Text className="mt-3 text-[15px] leading-relaxed text-black/70">
        Explore our latest collections and enjoy exclusive offers curated just
        for you.
      </Text>

      <Section className="mt-8">
        <Button
          href={`${APP_URL}/shop`}
          className="rounded-xl bg-[#ee0a0a] px-6 py-3 text-sm font-medium text-white no-underline"
        >
          Start Shopping
        </Button>
      </Section>
    </EmailLayout>
  );
}