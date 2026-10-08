import { Link, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

import EmailLayout, {
  EmailButton,
  EmailCard,
  EmailEyebrow,
  EmailHeading,
  EmailText,
} from "./email-layout";

type Props = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.12em] text-black/40">
        {label}
      </Text>

      <Text
        className="m-0 mb-4 mt-1 text-[15px] font-medium leading-[1.5] text-black"
        style={{ wordBreak: "break-word" }}
      >
        {children}
      </Text>
    </>
  );
}

export default function ContactEnquiryEmail({
  name,
  email,
  subject,
  message,
}: Props) {
  const replyHref = `mailto:${email}?subject=${encodeURIComponent(
    `Re: ${subject}`
  )}`;

  return (
    <EmailLayout preview={`New enquiry from ${name}: ${subject}`}>
      <EmailEyebrow>Contact form</EmailEyebrow>

      <EmailHeading>New enquiry</EmailHeading>

      <EmailText center>
        You received a new message from the website.
      </EmailText>

      <EmailCard>
        <Field label="From">{name}</Field>

        <Field label="Email">
          <Link
            href={`mailto:${email}`}
            className="text-[#ee0a0a] no-underline"
          >
            {email}
          </Link>
        </Field>

        <Field label="Subject">{subject}</Field>

        <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.12em] text-black/40">
          Message
        </Text>

        <Section className="mt-2 rounded-lg bg-white px-4 py-3">
          <Text
            className="m-0 text-[15px] leading-[1.7] text-black/70"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {message}
          </Text>
        </Section>
      </EmailCard>

      <EmailButton href={replyHref}>Reply to {name}</EmailButton>
    </EmailLayout>
  );
}