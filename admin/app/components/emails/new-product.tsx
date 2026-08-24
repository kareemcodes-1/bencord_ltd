import { Button, Heading, Img, Section, Text } from "@react-email/components";
import EmailLayout from "./email-layout";

type Props = {
  productName: string;
  productImage?: string;
  productSlug: string;
  price: string; // already formatted
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://loisbanksbeauty.com";

export default function NewProductEmail({
  productName,
  productImage,
  productSlug,
  price,
}: Props) {
  return (
    <EmailLayout preview={`New drop: ${productName}`}>
      {/* Eyebrow */}
      <Text className="m-0 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#ee0a0a]">
        Just dropped
      </Text>

      {/* Title */}
      <Heading className="mt-3 mb-0 text-center text-[26px] font-medium leading-tight text-black">
        {productName}
      </Heading>

      <Text className="mt-3 mb-0 text-center text-[15px] leading-relaxed text-black/55">
        A new piece just landed in the collection.
      </Text>

      {/* Product image card */}
      {productImage ? (
        <Section className="mt-8 overflow-hidden rounded-2xl bg-[#f5f5f5]">
          <Img
            src={productImage}
            alt={productName}
            width="100%"
            className="block w-full object-cover"
            style={{ maxHeight: "360px" }}
          />
        </Section>
      ) : null}

      {/* Price + message */}
      <Section className="mt-8 text-center">
        <Text className="m-0 text-[13px] font-medium uppercase tracking-[0.12em] text-black/40">
          Available now
        </Text>
        <Text className="mt-2 mb-0 text-[28px] font-medium leading-none text-black">
          {price}
        </Text>
        <Text className="mt-4 mb-0 text-[15px] leading-relaxed text-black/60">
          Soft textures, refined finish — made to stand out. Shop it before it’s
          gone.
        </Text>
      </Section>

      {/* CTA */}
      <Section className="mt-8 text-center">
        <Button
          href={`${APP_URL}/shop/p/${productSlug}`}
          className="rounded-full bg-[#ee0a0a] px-8 py-3.5 text-[13px] font-medium uppercase tracking-[0.08em] text-white no-underline"
        >
          Shop now
        </Button>
      </Section>

      {/* Secondary link */}
      <Text className="mt-6 mb-0 text-center text-[13px] text-black/40">
        Or{" "}
        <a
          href={`${APP_URL}/shop`}
          className="font-medium text-black underline"
        >
          browse the full collection
        </a>
      </Text>
    </EmailLayout>
  );
}