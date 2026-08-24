"use client";

import {
  ShieldCheck,
  Truck,
  PackageCheck,
  BadgeCheck,
  Headphones,
  Wallet,
} from "lucide-react";

import { SplitLines } from "@/components/animations/SplitLines";
import BlurText from "@/components/animations/blur-text";

const reasons = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Products",
    description:
      "We supply authentic printers, toner cartridges, ink cartridges, and office supplies from trusted brands.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Quick and reliable delivery across Ghana, keeping your business running without delays.",
  },
  {
    icon: PackageCheck,
    title: "Everything in One Place",
    description:
      "Shop printers, toner cartridges, ink cartridges, laptops, and office essentials all in one store.",
  },
  {
    icon: BadgeCheck,
    title: "Competitive Prices",
    description:
      "Quality products at fair prices, giving you the best value for your business.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description:
      "Our team is always ready to help you choose the right products and answer your questions.",
  },
  {
    icon: Wallet,
    title: "Secure Payments",
    description:
      "Enjoy a safe and seamless checkout with trusted and secure payment methods.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="w-full section-spacing bg-[#fafafa]">
      <div className="flex flex-col gap-10 md:gap-12 lg:gap-14">
        {/* Heading */}
        <div className="flex flex-col items-center gap-4 text-center px-4 sm:px-0">

          <SplitLines
    text="Why Choose Us"
    tag="span"
    className="subtitle"
    duration={0.8}
    stagger={0.02}
    ease="power3.out"
    yPercent={120}
    threshold={0.1}
    rootMargin="-80px"
  />

  <SplitLines
    text="Why Professionals Choose Bencord"
    tag="h2"
    className="heading-1"
    duration={1}
    stagger={0.025}
    ease="power3.out"
    yPercent={150}
    threshold={0.1}
    rootMargin="-100px"
    delay={0.05} // slight delay so subtitle appears first
  />

          <div className="line-border" />
        </div>

        {/* Grid */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-5
            sm:gap-6
            min-w-0
          "
        >
          {reasons.map((reason, index) => {
            const Icon = reason.icon;

            return (
              <div
                key={index}
                className="
                  min-w-0
                  rounded-2xl
                  bg-white
                  border
                  border-black/5
                  p-6
                  sm:p-7
                  lg:p-8
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >
                <div className="mb-5 sm:mb-6 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-red-50">
                  <Icon
                    size={24}
                    className="text-red-600 sm:hidden"
                    strokeWidth={2}
                  />
                  <Icon
                    size={28}
                    className="text-red-600 hidden sm:block"
                    strokeWidth={2}
                  />
                </div>

                <h3 className="mb-3 text-[1.2rem] sm:text-[1.35rem] font-semibold">
                  {reason.title}
                </h3>

                <p className="paragraph text-black/70">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;