import { Link, Text } from "@react-email/components";

import EmailLayout, {
  EmailButton,
  EmailEyebrow,
  EmailHeading,
  EmailText,
} from "./email-layout";

type Props = {
  name: string;
  resetUrl: string;
};

export default function PasswordResetEmail({
  name,
  resetUrl,
}: Props) {
  return (
    <EmailLayout preview="Reset your Bencord Ltd password">
      <EmailEyebrow>Password reset</EmailEyebrow>

      <EmailHeading>Reset your password</EmailHeading>

      <EmailText center>
        Hi {name}, we received a request to reset the password for your
        Bencord Ltd account. Use the button below to choose a new one.
        The link expires in{" "}
        <span className="font-medium text-black">1 hour</span>.
      </EmailText>

      <EmailButton href={resetUrl}>
        Reset password
      </EmailButton>

      <Text className="m-0 text-center text-[13px] leading-[1.6] text-black/50">
        If you didn&apos;t request this, you can safely ignore this
        email. Your password won&apos;t change.
      </Text>

      <Text className="m-0 mt-6 text-center text-[12px] leading-[1.6] text-black/40">
        Button not working? Copy and paste this link into your browser:
        <br />
        <Link
          href={resetUrl}
          className="text-black/50 underline"
          style={{ wordBreak: "break-all" }}
        >
          {resetUrl}
        </Link>
      </Text>
    </EmailLayout>
  );
}