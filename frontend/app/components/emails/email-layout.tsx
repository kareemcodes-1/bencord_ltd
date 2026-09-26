import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

type EmailLayoutProps = {
  preview: string;
  children: React.ReactNode;
};

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://bencordltd.com.ng";

const LOGO_URL =
  "https://ik.imagekit.io/jl7pziosr/logo.jpeg";

export default function EmailLayout({
  preview,
  children,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>

      <Tailwind>
        <Body className="bg-[#fafafa] font-sans">
          <Container className="mx-auto my-10 max-w-[560px] overflow-hidden rounded-2xl bg-white">

            {/* Header */}
            <Section className="border-b border-black/5 px-10 py-8 text-center">
              <Link href={APP_URL}>
                <Img
                  src={LOGO_URL}
                  alt="Bencord Ltd"
                  width={140}
                  height={46}
                  className="mx-auto object-cover"
                />
              </Link>
            </Section>

            {/* Content */}
            <Section className="px-10 py-10">
              {children}
            </Section>

            {/* Footer */}
            <Section className="border-t border-black/5 bg-[#fafafa] px-10 py-8 text-center">

              <Text className="m-0 text-[13px] leading-relaxed text-black/60">
                Thanks for choosing Bencord Ltd.
              </Text>

              <Text className="mt-3 m-0 text-[12px] leading-relaxed text-black/45">
                If you have any questions or need help, feel free to
                reach out to us.
              </Text>

              {/* Links */}
              <Text className="mt-4 m-0 text-[12px] leading-relaxed text-black/45">
                <Link
                  href={APP_URL}
                  className="text-black/50 underline"
                >
                  Visit our website
                </Link>

                {" · "}

                <Link
                  href={`${APP_URL}/contact`}
                  className="text-black/50 underline"
                >
                  Contact us
                </Link>
              </Text>

              {/* Email */}
              <Text className="mt-3 m-0 text-[12px] leading-relaxed text-black/45">
                Email:{" "}
                <Link
                  href="mailto:bencordinvestmentt@gmail.com"
                  className="text-black/50 underline"
                >
                  bencordinvestmentt@gmail.com
                </Link>
              </Text>

              {/* Phone */}
              <Text className="mt-1 m-0 text-[12px] leading-relaxed text-black/45">
                Phone:{" "}
                <Link
                  href="tel:+233552256922"
                  className="text-black/50 underline"
                >
                  +233 55 225 6922
                </Link>
              </Text>

              {/* WhatsApp */}
              <Text className="mt-1 m-0 text-[12px] leading-relaxed text-black/45">
                WhatsApp:{" "}
                <Link
                  href="https://wa.me/+2348182387806"
                  className="text-black/50 underline"
                >
                  +234 818 238 7806
                </Link>
              </Text>

              {/* Address */}
              <Text className="mt-4 m-0 text-[12px] leading-relaxed text-black/45">
                71, Jones Nelson Road,
                <br />
                Goil Filling Station,
                <br />
                Opposite CUA House, Accra
              </Text>

              {/* Opening Hours */}
              <Text className="mt-4 m-0 text-[12px] leading-relaxed text-black/45">
                Monday – Friday
                <br />
                8:00 AM – 5:00 PM
              </Text>

              {/* Socials */}
              <Text className="mt-5 m-0 text-[12px] leading-relaxed text-black/45">
                Follow us:
                {" "}
                <Link
                  href="https://www.instagram.com/bencord_ltd"
                  className="text-black/50 underline"
                >
                  Instagram
                </Link>
                {" · "}
                <Link
                  href="https://www.facebook.com/share/1EUezpzKmX/?mibextid=wwXIfr"
                  className="text-black/50 underline"
                >
                  Facebook
                </Link>
                {" · "}
                <Link
                  href="https://www.tiktok.com/@bencord_ltd?_r=1&_t=ZS-97SWqjySiTU"
                  className="text-black/50 underline"
                >
                  TikTok
                </Link>
              </Text>

              {/* WhatsApp */}
              <Text className="mt-2 m-0 text-[12px] leading-relaxed text-black/45">
                <Link
                  href="https://wa.me/+2348182387806"
                  className="text-black/50 underline"
                >
                  Chat with us on WhatsApp
                </Link>
              </Text>

              {/* Copyright */}
              <Text className="mt-6 m-0 text-[11px] text-black/30">
                Bencord Ltd · All rights reserved.
              </Text>

            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
