import { Heading, Section, Text } from "@react-email/components";
import EmailLayout from "./email-layout";

type Props = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactEnquiryEmail({
  name,
  email,
  subject,
  message,
}: Props) {
  return (
    <EmailLayout preview={`New enquiry from ${name}: ${subject}`}>
      <Text className="m-0 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#ee0a0a]">
        Contact form
      </Text>

      <Heading className="mt-3 mb-0 text-center text-[26px] font-medium leading-tight text-black">
        New enquiry
      </Heading>

      <Text className="mt-4 mb-0 text-center text-[15px] leading-relaxed text-black/60">
        Someone sent a message from the LoisBanks Beauty contact form.
      </Text>

      <Section className="mt-8 rounded-2xl bg-[#fafafa] px-5 py-4">
        <Text className="m-0 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
          From
        </Text>
        <Text className="mt-1 mb-0 text-[15px] font-medium text-black">
          {name}
        </Text>
        <Text className="mt-1 mb-0 text-[14px] text-black/60">{email}</Text>

        <Text className="mt-5 m-0 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
          Subject
        </Text>
        <Text className="mt-1 mb-0 text-[15px] font-medium text-black">
          {subject}
        </Text>

        <Text className="mt-5 m-0 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
          Message
        </Text>
        <Text className="mt-1 mb-0 whitespace-pre-wrap text-[15px] leading-relaxed text-black/70">
          {message}
        </Text>
      </Section>

      <Text className="mt-6 mb-0 text-center text-[13px] text-black/45">
        Reply directly to this email to respond to {name}.
      </Text>
    </EmailLayout>
  );
}