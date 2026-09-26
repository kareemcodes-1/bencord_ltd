import Script from "next/script";

export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bencord Ltd",
    url: "https://bencordltd.com.ng",
    logo: "https://ik.imagekit.io/jl7pziosr/logo.jpeg",
    description:
      "Bencord Ltd supplies genuine printers, toner cartridges, ink cartridges, laptops, accessories, and office supplies across Ghana.",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "71, Jones Nelson Road, Goil Filling Station, Opposite CUA House",
      addressLocality: "Accra",
      addressCountry: "GH",
    },
    areaServed: {
      "@type": "Country",
      name: "Ghana",
    },
    sameAs: [
      "https://www.instagram.com/bencord_ltd",
      "https://www.facebook.com/share/1EUezpzKmX/?mibextid=wwXIfr",
      "https://www.tiktok.com/@bencord_ltd",
    ],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}