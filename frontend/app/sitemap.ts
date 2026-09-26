import type { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bencordltd.com.ng";

  await connectDB();

  const products = await Product.find({
    isActive: true,
  }).select("slug updatedAt");

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/shop/p/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
    },

    ...productUrls,
  ];
}