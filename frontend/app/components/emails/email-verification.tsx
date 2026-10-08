import { Section, Text } from "@react-email/components";
import EmailLayout, {
  EmailEyebrow,
  EmailHeading,
  EmailText,
} from "./email-layout";

type Props = {
  name: string;
  code: string;
};

const MONO = "'SF Mono', Menlo, Consolas, 'Courier New', monospace";

export default function EmailVerificationEmail({
  name,
  code,
}: Props) {
  return (
    <EmailLayout
      preview={`Your Bencord Ltd verification code is ${code}`}
    >
      <EmailEyebrow>Email verification</EmailEyebrow>

      <EmailHeading>Verify your email</EmailHeading>

      <EmailText center>
        Hi {name}, use the code below to verify your Bencord Ltd account.
      </EmailText>

      <Section className="my-6 rounded-lg bg-[#fafafa] px-4 py-6 text-center">
        <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.12em] text-black/40">
          Verification code
        </Text>

        <Text
          className="m-0 mt-3 text-[28px] font-semibold leading-none text-black sm:text-[32px]"
          style={{
            fontFamily: MONO,
            letterSpacing: "0.3em",
            paddingLeft: "0.3em",
            wordBreak: "keep-all",
          }}
        >
          {code}
        </Text>
      </Section>

      <Text className="m-0 text-center text-[13px] leading-[1.6] text-black/50">
        This code expires in 10 minutes. If you didn&apos;t request it,
        you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}