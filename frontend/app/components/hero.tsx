"use client";

import Link from "next/link";
import Image from "next/image";
import { SplitLines } from "@/components/animations/SplitLines";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Hero() {

  const buttonRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    if (!buttonRef.current) return;

    gsap.set(buttonRef.current, {
      yPercent: 300,
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        gsap.to(buttonRef.current, {
          yPercent: 0,
          duration: 1,
          ease: "power3.out",
        });

        observer.disconnect();
      },
      {
        rootMargin: "0px",
      },
    );

    observer.observe(buttonRef.current);

    return () => observer.disconnect();
  });

  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:min-h-screen lg:flex lg:items-center">
      <div className="mx-auto grid w-full items-start gap-10 px-6 sm:gap-12 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12 xl:px-16">
        {/* Left Side */}

        <div className="flex flex-col items-start">
          <div className="overflow-hidden">
            <h1 className="text-4xl leading-tight sm:text-[2.9rem] sm:leading-[1.05] lg:text-[3.5rem]">
              <div className="flex flex-wrap gap-x-2 sm:gap-x-3">
                <SplitLines
                  text="Trusted"
                  tag="h1"
                  className="text-black"
                  duration={1}
                  stagger={0.025}
                  ease="power3.out"
                  yPercent={150}
                />

                <SplitLines
                  text="Office"
                  tag="h1"
                  className="text-[#ee0a0a]"
                  duration={1}
                  stagger={0.025}
                  ease="power3.out"
                  yPercent={150}
                />

                <SplitLines
                  text="Supplies"
                  tag="h1"
                  className="text-[#ee0a0a]"
                  duration={1}
                  stagger={0.025}
                  ease="power3.out"
                  yPercent={150}
                />

                <SplitLines
                  text="Delivered"
                  tag="h1"
                  className="text-black"
                  duration={1}
                  stagger={0.025}
                  ease="power3.out"
                  yPercent={150}
                />

                <SplitLines
                  text="Across"
                  tag="h1"
                  className="text-black"
                  duration={1}
                  stagger={0.025}
                  ease="power3.out"
                  yPercent={150}
                />

                <SplitLines
                  text="Ghana"
                  tag="h1"
                  className="text-[#ee0a0a]"
                  duration={1}
                  stagger={0.025}
                  ease="power3.out"
                  yPercent={150}
                />
              </div>
            </h1>
          </div>

          <SplitLines
            text={'We supply genuine printers, toner cartridges, ink cartridges, and office essentials with fast, reliable delivery across Ghana.'}
            tag="p"
            className="paragraph mt-4 max-w-xl text-black/65 sm:mt-6"
            duration={1}
            stagger={0.025}
            ease="power3.out"
            yPercent={150}
            threshold={0.1}
            rootMargin="0px"
          />

          <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row">
              <Link
                href={"/shop"}
                className="btn-primary"
              >
                {"Shop Now"}
              </Link>
          </div>
        </div>

        {/* Right Side */}

        <div className="relative flex items-center justify-center">
          {/* Background Blur */}
          <div className="absolute right-4 top-6 h-48 w-48 rounded-full bg-red-100 blur-3xl sm:right-8 sm:top-10 sm:h-72 sm:w-72" />

          <div
            className="
      relative
      mx-auto
      aspect-square
      w-full
      max-w-[420px]
      overflow-hidden
      rounded-[.5rem]
      lg:mx-0
      lg:aspect-auto
      lg:h-[350px]
      lg:w-[520px]
      lg:max-w-none
    "
          >
            <Image
              src={'https://ik.imagekit.io/jl7pziosr/OLWm2.png'}
              alt={"Printer"}
              fill
              quality={100}
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}