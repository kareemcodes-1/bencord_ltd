import type { Metadata } from "next";

import { getProductBySlug } from "@/actions/product.actions";

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "This product could not be found.",
    };
  }

  const image = product.media.find((item) => item.type === "image")?.url;

  return {
    title: `${product.name}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: image ? [image] : undefined,
    },
  };
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return children;
}