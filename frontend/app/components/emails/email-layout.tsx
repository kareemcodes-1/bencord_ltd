import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const APP_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "https://bencordltd.com.ng";

const LOGO_URL =
  "https://ik.imagekit.io/jl7pziosr/logo.jpeg";

const BRAND = "#ee0a0a";

// Geist first, with sensible fallbacks for email clients.
const SANS =
  'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif';

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

export default function EmailLayout({
  preview,
  children,
}: EmailLayoutProps) {
  return (
    <Tailwind>
  <Html lang="en">
    <Head>
      <style>{`
        * {
          font-family: ${SANS};
        }

        body,
        table,
        td,
        p,
        a,
        span,
        div {
          font-family: ${SANS};
        }
      `}</style>
    </Head>

    <Preview>{preview}</Preview>

    <Body
      className="m-0 bg-[#f5f5f5] p-0"
      style={{ fontFamily: SANS }}
    >
         <Container className="mx-auto my-6 w-full max-w-[560px] overflow-hidden rounded-xl bg-white sm:my-10">
            {/* Brand accent */}
            <Section className="h-[4px] bg-[#ee0a0a]" />

            {/* Header */}
            <Section className="px-6 pb-2 pt-8 text-center sm:px-10 sm:pt-10">
              <Link
                href={APP_URL}
                style={{
                  fontFamily: SANS,
                }}
              >
                <Img
                  src={LOGO_URL}
                  alt="Bencord Ltd"
                  width={140}
                  height={46}
                  className="mx-auto h-auto max-w-[140px] object-contain"
                />
              </Link>
            </Section>

            {/* Content */}
            <Section className="px-6 pb-8 pt-6 sm:px-10 sm:pb-10">
              {children}
            </Section>

            {/* Footer */}
            <Section className="bg-[#fafafa] px-6 py-8 text-center sm:px-10">
              <Text
                className="m-0 text-[13px] leading-[1.6] text-black/60"
                style={{ fontFamily: SANS }}
              >
                Need help?{" "}
                <Link
                  href={`${APP_URL}/contact`}
                  className="text-[#ee0a0a] underline"
                  style={{ fontFamily: SANS }}
                >
                  Send us a message
                </Link>{" "}
                on our contact page, we&apos;re happy to help.
              </Text>

              <Text
                className="m-0 mt-4 text-[12px] leading-[1.8] text-black/50"
                style={{ fontFamily: SANS }}
              >
                <Link
                  href={`${APP_URL}/shop`}
                  className="text-black/50 underline"
                  style={{ fontFamily: SANS }}
                >
                  Shop
                </Link>
                {"  ·  "}
                <Link
                  href={`${APP_URL}/contact`}
                  className="text-black/50 underline"
                  style={{ fontFamily: SANS }}
                >
                  Contact
                </Link>
                {"  ·  "}
                <Link
                  href="https://www.instagram.com/bencord_ltd"
                  className="text-black/50 underline"
                  style={{ fontFamily: SANS }}
                >
                  Instagram
                </Link>
              </Text>

              <Text
                className="m-0 mt-2 text-[12px] leading-[1.8] text-black/50"
                style={{ fontFamily: SANS }}
              >
                <Link
                  href="mailto:bencordinvestmentt@gmail.com"
                  className="text-black/50 underline"
                  style={{ fontFamily: SANS }}
                >
                  bencordinvestmentt@gmail.com
                </Link>
                {"  ·  "}
                <Link
                  href="https://wa.me/+2348182387806"
                  className="text-black/50 underline"
                  style={{ fontFamily: SANS }}
                >
                  +234 818 238 7806
                </Link>
              </Text>

              <Text
                className="m-0 mt-6 text-[11px] text-black/30"
                style={{ fontFamily: SANS }}
              >
                © {new Date().getFullYear()} Bencord Ltd
              </Text>
            </Section>
          </Container>
    </Body>
  </Html>
</Tailwind>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable building blocks                                                   */
/* -------------------------------------------------------------------------- */

export function EmailEyebrow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Text
      className="m-0 mb-2 text-center text-[12px] font-medium uppercase tracking-[-0.02em] text-[#ee0a0a]"
      style={{
        fontFamily: SANS,
      }}
    >
      {children}
    </Text>
  );
}

/** Main email heading. */
export function EmailHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Text
      className="m-0 mb-4 text-center text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#171717] sm:text-[30px]"
      style={{
        fontFamily: SANS,
        fontWeight: 600,
      }}
    >
      {children}
    </Text>
  );
}

/** Body paragraph. */
export function EmailText({
  children,
  center = false,
}: {
  children: ReactNode;
  center?: boolean;
}) {
  return (
    <Text
      className={`m-0 mb-4 text-[15px] leading-[1.7] text-black/70 ${
        center ? "text-center" : "text-left"
      }`}
      style={{
        fontFamily: SANS,
      }}
    >
      {children}
    </Text>
  );
}

/** Button. */
export function EmailButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Section className="my-6 text-center">
      <Button
        href={href}
        className="box-border inline-block rounded-[.75rem] px-8 py-[14px] text-center text-[12px] font-medium uppercase text-white no-underline"
        style={{
          backgroundColor: BRAND,
          fontFamily: SANS,
          fontWeight: 500,
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

/** Soft grey card. */
export function EmailCard({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Section
      className="my-6 rounded-lg bg-[#fafafa] p-5"
      style={{
        fontFamily: SANS,
      }}
    >
      {children}
    </Section>
  );
}

/** Thin divider. */
export function EmailDivider() {
  return (
    <Hr
      className="mx-0 my-6 border-0 border-t border-solid border-black/10"
      style={{
        fontFamily: SANS,
      }}
    />
  );
}