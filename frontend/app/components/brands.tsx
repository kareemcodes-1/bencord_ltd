"use client";

import Image from "next/image";
import Marquee from "react-fast-marquee";
import { SplitLines } from "@/components/animations/SplitLines";

const brands = [
  {
    name: "HP",
    logo: "https://claytonprints.com/wp-content/uploads/2025/09/cricut-logo-1.png",
  },
  {
    name: "Canon",
    logo: "https://claytonprints.com/wp-content/uploads/2025/09/canon-logo-1.png",
  },
  {
    name: "Epson",
    logo: "https://claytonprints.com/wp-content/uploads/2025/09/epson-logo-1.png",
  },
  {
    name: "Brother",
    logo: "https://claytonprints.com/wp-content/uploads/2025/09/mimaki-logo-1.png",
  },

];

export default function Brands() {
  return (
    <section className="section-spacing overflow-hidden">

      <div className="mx-auto flex w-full max-w-5xl px-4 sm:px-6 lg:px-0">

  <div className="relative w-full">
    {/* Left Fade */}
    <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-12 sm:w-20 lg:w-32 bg-gradient-to-r from-white to-transparent" />

    {/* Right Fade */}
    <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-12 sm:w-20 lg:w-32 bg-gradient-to-l from-white to-transparent" />

    <Marquee speed={45} pauseOnHover gradient={false}>
      {brands.map((brand) => (
        <div
          key={brand.name}
          className="
            mx-4
            flex
            h-20
            w-36
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-black/5
            bg-white
            px-5
            shadow-sm
            sm:mx-6
            sm:h-24
            sm:w-44
            sm:px-6
            lg:mx-8
            lg:h-28
            lg:w-52
            lg:px-8
          "
        >
          <Image
            src={brand.logo}
            alt={brand.name}
            width={140}
            height={60}
            className="h-8 w-auto object-contain sm:h-10 lg:h-12"
          />
        </div>
      ))}
    </Marquee>
  </div>
</div>
    </section>
  );
}