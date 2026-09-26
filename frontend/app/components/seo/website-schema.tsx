import Script from "next/script";

export default function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bencord Ltd",
    url: "https://bencordltd.com.ng",

    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://bencordltd.com.ng/shop?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },

    hasPart: [
      {
        "@type": "SiteNavigationElement",
        name: "Shop",
        url: "https://bencordltd.com.ng/shop",
      },
      {
        "@type": "SiteNavigationElement",
        name: "About",
        url: "https://bencordltd.com.ng/about",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Contact",
        url: "https://bencordltd.com.ng/contact",
      },
    ],
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}