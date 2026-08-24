"use client";

import Link from "next/link";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const footerSections = [
  {
    title: "Quick Links",
    items: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Shop", href: "/shop" },
      { label: "Contact", href: "/contact" },
    ],
  },

  {
    title: "Contact",
    items: [
      {
        label: "Phone",
        value: "+233552256922",
        href: "tel:+233552256922",
      },
      {
        label: "Email",
        value: "bencordinvestmentt@gmail.com",
        href: "mailto:bencordinvestmentt@gmail.com",
      },
    ],
  },

  {
    title: "Business Info",
    items: [
      {
        label: "Open Hours",
        value: "Monday – Friday\n8:00 AM – 5:00 PM",
      },
      {
      label: "Address",
      value:
        "71, JONES NELSON ROAD , GOIL FILLING STATION, OPPOSITE CUA HOUSE, ACCRA",
      href: "https://www.google.com/maps/dir//Bencord+ltd,+Opposite+CUA+House,+71,+Jones+Nelson+Road+Goil+filling+station,+Ghana/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0xfdf91c8b23506e3:0xb83c276c1cff35fb?sa=X&ved=1t:57443&ictx=111",
    },
    ],
  },

  {
    title: "Socials",
    socials: [
      {
        href: "https://www.instagram.com/bencord_ltd",
        icon: FaInstagram,
      },
      {
        href: "https://www.facebook.com/share/1EUezpzKmX/?mibextid=wwXIfr",
        icon: FaFacebookF,
      },
      {
        href: "https://www.tiktok.com/@bencord_ltd?_r=1&_t=ZS-97SWqjySiTU",
        icon: FaTiktok,
      },
      {
        href: "https://wa.me/+2348182387806",
        icon: FaWhatsapp,
      },
    ],
  },
];

const Footer = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Skip animation on mobile/tablet to avoid layout issues
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;

    const ctx = gsap.context(() => {
      gsap.set(".footer", { yPercent: -50 });

      const uncover = gsap.timeline({ paused: true });
      uncover.to(".footer", {
        yPercent: 0,
        ease: "none",
      });

      ScrollTrigger.create({
        id: "footer-uncover",
        trigger: ".scroll-trigger",
        start: "bottom bottom",
        end: "+=50%",
        animation: uncover,
        scrub: true,
        invalidateOnRefresh: true,
      });

      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getById("footer-uncover")?.kill();
    };
  }, [pathname]);

  return (
    <>
      {/* Only needed for desktop reveal */}
      <div className="section scroll-trigger hidden lg:block" />

      <div className="relative overflow-hidden bg-black">
        <footer
          className="
            footer
            relative
            z-10
            mt-10
            pt-14
            sm:pt-16
            lg:pt-20
            pb-8
            text-white
          "
        >
          {/* Grid */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-8
              sm:gap-10
              px-6
              sm:px-8
              lg:px-12
              min-w-0
            "
          >
            {footerSections.map((section: any) => (
              <div
                key={section.title}
                className="flex min-w-0 flex-col gap-4 sm:gap-5"
              >
                <h4 className="text-[1.1rem] font-medium text-[#e10707f0] sm:text-[1.2rem]">
                  {section.title}
                </h4>

                {section.items && (
                  <div className="flex min-w-0 flex-col gap-4 text-white/60 sm:gap-5">
                    {section.items.map((item: any) => (
                      <div key={item.label} className="min-w-0 break-words">
                        {item.value ? (
                          <>
                            <p className="text-sm font-medium text-white">
                              {item.label}
                            </p>
                            {item.href ? (
                              <Link
                                href={item.href}
                                className="break-words whitespace-pre-line transition hover:text-red-500"
                              >
                                {item.value}
                              </Link>
                            ) : (
                              <p className="break-words whitespace-pre-line">
                                {item.value}
                              </p>
                            )}
                          </>
                        ) : (
                          <Link
                            href={item.href!}
                            className="transition hover:text-red-500"
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {section.socials && (
                  <div className="flex flex-wrap items-center gap-3">
                    {section.socials.map((social: any) => {
                      const Icon = social.icon;
                      return (
                        <Link
                          key={social.href}
                          href={social.href}
                          target="_blank"
                          className="
                            flex h-10 w-10 shrink-0 items-center justify-center
                            rounded-full bg-white/10 transition-all duration-300
                            hover:bg-red-600 hover:text-white
                          "
                        >
                          <Icon size={17} />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Huge text - desktop only */}
          <h2
            className="
              pointer-events-none mt-0 hidden select-none overflow-hidden
              px-[2rem] text-[17rem] font-black uppercase !tracking-[-0.11em]
              text-[#1d1d1d] opacity-80 lg:block
            "
          >
            BENCORD
          </h2>

          {/* Bottom */}
          <div
            className="
              flex min-w-0 flex-col items-center justify-between gap-5
              px-6 pt-8 text-center text-sm text-white/50
              sm:gap-6 sm:px-8 lg:flex-row lg:px-12
            "
          >
            <p>© {new Date().getFullYear()} Bencord Ltd. All rights reserved.</p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link
                href="/shipping-policy"
                className="transition hover:text-red-500"
              >
                Shipping Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Footer;

