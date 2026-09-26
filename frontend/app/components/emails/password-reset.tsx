import { Button, Heading, Section, Text } from "@react-email/components";
import EmailLayout from "./email-layout";

type Props = {
  name: string;
  resetUrl: string;
};

export default function PasswordResetEmail({ name, resetUrl }: Props) {
  return (
    <EmailLayout preview="Reset your LoisBanks Beauty password">
      <Text className="m-0 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#FD3F92]">
        Password Reset
      </Text>

      <Heading className="mt-3 mb-0 text-center text-[26px] font-medium leading-tight text-black">
        Reset your password
      </Heading>

      <Text className="mt-4 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        Hi {name}, we received a request to reset the password for your
        LoisBanks Beauty account.
      </Text>

      <Text className="mt-3 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        Click the button below to create a new password. This link expires in{" "}
        <span className="font-medium text-black">1 hour</span>.
      </Text>

      <Section className="mt-8 text-center">
        <Button
          href={resetUrl}
          className="rounded-full bg-[#FD3F92] px-8 py-3.5 text-[13px] font-medium uppercase tracking-[0.08em] text-white no-underline"
        >
          Reset Password
        </Button>
      </Section>

      <Text className="mt-8 mb-0 text-center text-[13px] leading-relaxed text-black/45">
        If you didn&apos;t request a password reset, you can safely ignore this
        email. Your password will remain unchanged.
      </Text>

      <Text className="mt-6 mb-0 text-center text-[12px] leading-relaxed text-black/35">
        If the button above doesn&apos;t work, copy and paste the password reset
        link into your browser.
      </Text>
    </EmailLayout>
  );
}

