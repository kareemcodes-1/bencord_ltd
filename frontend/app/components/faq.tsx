"use client";

import { SplitLines } from "@/components/animations/SplitLines";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I know which toner or ink cartridge fits my printer?",
    answer:
      "Every product page lists the compatible printer models. If you’re still unsure, just message us with your printer model and we’ll recommend the correct cartridge before you order.",
  },
  {
    question: "How long does it take for my order to be confirmed?",
    answer:
      "Orders are usually confirmed within 24 to 48 hours. Once confirmed, we’ll notify you and begin preparing your items for delivery or pickup.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Yes, we accept online payments via Paystack, including bank transfers, mobile money, and cards.",
  },
  {
    question: "Do you deliver across Ghana?",
    answer:
      "Yes, we deliver nationwide. Delivery timelines vary depending on your location, and we’ll keep you updated once your order is on the way.",
  },
  {
    question: "Can I return a product?",
    answer:
      "We do not accept returns. Please double-check your order details and product compatibility before completing your purchase. If you receive a wrong or damaged item, contact us immediately and we’ll assist you.",
  },
  {
    question: "Can I place bulk orders for my office or school?",
    answer:
      "Absolutely. We regularly supply businesses, schools, and organizations. Contact us with your requirements and we’ll provide pricing and support for bulk orders.",
  },
];

export default function FAQSection() {
  return (
    <section className="section-spacing bg-white">
      <div className="mx-auto max-w-4xl ">
        {/* Heading */}

        <div className="mb-10 sm:mb-12 lg:mb-14 flex flex-col items-center gap-4 text-center">

          <SplitLines
            text="FAQs"
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
            text="Answers to Common Questions"
            tag="h2"
            className="heading-1"
            duration={1}
            stagger={0.025}
            ease="power3.out"
            yPercent={150}
            threshold={0.1}
            rootMargin="-100px"
            delay={0.05}
          />

          <div className="line-border" />
        </div>

        {/* FAQ */}

        <Accordion
          type="single"
          collapsible
          className="w-full space-y-3 sm:space-y-4 max-w-3xl mx-auto min-w-0"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="
                min-w-0
                rounded-xl
                sm:rounded-2xl
                border
                border-black/10
                bg-white
                px-4
                sm:px-6
                transition-all
                duration-300
                hover:border-red-600/30
                 hover:bg-red-50
                 hover:shadow-sm
              "
            >
              <AccordionTrigger
                className="
                  py-5
                  sm:py-6
                  text-left
                  text-base
                  sm:text-lg
                  font-medium
                  gap-4
                  hover:no-underline
                "
              >
                {faq.question}
              </AccordionTrigger>

              <AccordionContent
                className="
                  pb-5
                  sm:pb-6
                  text-[0.95rem]
                  sm:text-[1rem]
                  font-medium
                  font-inter
                  text-black/70
                "
              >
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}