import { Img, Link, Section, Text } from "@react-email/components";

import EmailLayout, {
  EmailButton,
  EmailEyebrow,
  EmailHeading,
  EmailText,
} from "./email-layout";

type Props = {
  productName: string;
  productImage?: string;
  productSlug: string;
  price: string; // formatted current price
  originalPrice?: string; // formatted original price if discounted
  discountLabel?: string; // e.g. "20% OFF"
  description?: string;
  unsubscribeUrl: string;
};

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "https://bencordltd.com.ng";


export default function NewProductEmail({
  productName,
  productImage,
  productSlug,
  price,
  originalPrice,
  discountLabel,
  description,
  unsubscribeUrl,
}: Props) {
  const productUrl = `${FRONTEND_URL}/shop/p/${productSlug}`;

  return (
    <EmailLayout preview={`New drop: ${productName}`}>
      <EmailEyebrow>Just dropped</EmailEyebrow>

      <EmailHeading>A new product is here</EmailHeading>

      <EmailText center>
        Something new just landed at Bencord Ltd.
      </EmailText>

      {/* Product image */}
      {productImage ? (
        <Section className="my-6 overflow-hidden rounded-lg bg-[#f5f5f5]">
          <Link href={productUrl}>
            <Img
              src={productImage}
              alt={productName}
              width={480}
              className="block h-auto w-full max-w-full"
              style={{
                width: "100%",
                height: "auto",
              }}
            />
          </Link>
        </Section>
      ) : null}

      {/* Product details */}
      <Section className="text-center">
        <Text
          className="m-0 text-[20px] font-medium leading-[1.3] tracking-[-0.01em] text-[#171717]"
          style={{
            wordBreak: "break-word",
          }}
        >
          {productName}
        </Text>

        {discountLabel ? (
          <Text className="m-0 mt-3 text-[12px] font-medium uppercase tracking-[0.12em] text-[#ee0a0a]">
            {discountLabel}
          </Text>
        ) : null}

        <Text className="m-0 mt-2 text-[24px] font-medium leading-none text-black">
          {price}

          {originalPrice ? (
            <span className="ml-2 text-[14px] font-normal text-black/40 line-through">
              {originalPrice}
            </span>
          ) : null}
        </Text>

        <Text
          className="m-0 mt-4 text-[14px] leading-[1.7] text-black/60"
          style={{ wordBreak: "break-word" }}
        >
          {description ??
            "Made to stand out. Shop it while it&apos;s available."}
        </Text>
      </Section>

      <EmailButton href={productUrl}>Shop now</EmailButton>

      <Text className="m-0 text-center text-[13px] text-black/50">
        Or{" "}
        <Link
          href={`${FRONTEND_URL}/shop`}
          className="font-medium text-black underline"
        >
          browse the full collection
        </Link>
      </Text>

      <Text className="m-0 mt-8 text-center text-[11px] leading-[1.6] text-black/40">
        You&apos;re receiving this because you subscribed to Bencord Ltd
        updates.
        <br />
        <Link
          href={unsubscribeUrl}
          className="text-black/50 underline"
        >
          Unsubscribe
        </Link>
      </Text>
    </EmailLayout>
  );
}