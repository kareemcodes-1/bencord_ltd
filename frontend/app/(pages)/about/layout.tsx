import type { Metadata } from "next";
import React from "react";


export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Bencord Ltd, our commitment to providing quality office supplies, printers, ink cartridges, toner cartridges, and computer accessories to businesses and individuals.",
};

const AboutLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <>{children}</>;
};

export default AboutLayout;