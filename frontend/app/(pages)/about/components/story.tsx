import Image from "next/image";
import { SplitLines } from "@/components/animations/SplitLines";

export default function FounderStory() {
  return (
    <section className="w-full pt-[6rem] pb-[3rem] px-4 sm:px-6 sm:pt-[8rem] sm:pb-[3.5rem] lg:pt-[10rem] lg:pb-[4rem] lg:px-[3rem] bg-white">
      <div className="mx-auto max-w-7xl min-w-0">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left Image */}
          <div
            className="
              relative
              h-[20rem]
              w-full
              overflow-hidden
              rounded-2xl
              sm:h-[26rem]
              md:h-[30rem]
            "
          >
            <Image
              src="https://ik.imagekit.io/jl7pziosr/WhatsApp%20Image%202026-06-23%20at%2013.08.06.jpeg"
              alt="Clayton Prints Founder"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Right Content */}
          <div className="flex flex-col gap-4 sm:gap-5 min-w-0">
            <SplitLines
              text="Our Story"
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
              text="Powering Offices Across Ghana"
              tag="h2"
              className="heading-2 max-w-full lg:max-w-[32rem] text-black"
              duration={1}
              stagger={0.025}
              ease="power3.out"
              yPercent={150}
              threshold={0.1}
              rootMargin="-100px"
              delay={0.12}
            />

            <SplitLines
              text="For over 10 years, we've helped businesses, schools, and organizations across Ghana source genuine printers, toner cartridges, ink cartridges, laptops, and office essentials. We're committed to quality products, reliable service, and fast nationwide delivery that keeps workplaces running efficiently."
              tag="p"
              className="paragraph max-w-full lg:max-w-[34rem] text-black/70"
              duration={1}
              stagger={0.015}
              ease="power3.out"
              yPercent={80}
              threshold={0.1}
              rootMargin="-60px"
              delay={0.25}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1 lg:max-w-[32rem]">
              {[
                {
                  value: "10+",
                  label: "Years in Business",
                },
                {
                  value: "5,000+",
                  label: "Happy Customers",
                },
                {
                  value: "1,000+",
                  label: "Products Available",
                },
                {
                  value: "100%",
                  label: "Genuine Products",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="
                    min-w-0
                    rounded-xl
                    sm:rounded-2xl
                    border
                    border-black/10
                    bg-[#f8f8f8]
                    p-3.5
                    sm:p-4
                  "
                >
                  <h3 className="text-[1.5rem] sm:text-[1.75rem] lg:text-[2rem] font-bold text-[#ff0000]">
                    {item.value}
                  </h3>

                  <p className="mt-1 text-xs sm:text-sm text-black/65">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}