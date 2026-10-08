import EmailLayout, {
  EmailButton,
  EmailEyebrow,
  EmailHeading,
  EmailText,
} from "./email-layout";

type Props = {
  name: string;
};

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://bencordltd.com.ng";

export default function WelcomeEmail({ name }: Props) {
  return (
    <EmailLayout preview="Welcome to Bencord Ltd">
      <EmailEyebrow>Welcome</EmailEyebrow>

      <EmailHeading>Welcome to Bencord Ltd</EmailHeading>

      <EmailText center>
        Hi {name}, we&apos;re so happy to have you here. Discover our
        products and services, explore what we have to offer, and enjoy
        a seamless experience with Bencord Ltd.
      </EmailText>

      <EmailButton href={`${APP_URL}/shop`}>
        Shop now
      </EmailButton>
    </EmailLayout>
  );
}