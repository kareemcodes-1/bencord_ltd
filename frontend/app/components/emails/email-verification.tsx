import { Heading, Section, Text } from "@react-email/components";
import EmailLayout from "./email-layout";

type Props = {
  name: string;
  code: string;
};

export default function EmailVerificationEmail({
  name,
  code,
}: Props) {
  return (
    <EmailLayout
      preview={`Your Bencord Ltd verification code is ${code}`}
    >
      <Text className="m-0 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#ee0a0a]">
        Email verification
      </Text>

      <Heading className="mt-3 mb-0 text-center text-[26px] font-medium leading-tight text-black">
        Verify your email
      </Heading>

      <Text className="mt-4 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        Hi {name}, use the verification code below to verify your
        Bencord Ltd account.
      </Text>

      <Section className="mt-8 rounded-2xl bg-[#fafafa] px-5 py-6 text-center">
        <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
          Verification code
        </Text>

        <Text className="mt-3 mb-0 font-mono text-[32px] font-semibold tracking-[0.3em] text-black">
          {code}
        </Text>
      </Section>

      <Text className="mt-6 mb-0 text-center text-[13px] leading-relaxed text-black/45">
        This code expires in 10 minutes. If you did not request this
        code, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
