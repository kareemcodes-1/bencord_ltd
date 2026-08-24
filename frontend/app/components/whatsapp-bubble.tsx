"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348182387806";
const DEFAULT_MESSAGE = "Hi! I'd like to ask about a product.";

export default function WhatsAppBubble() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    DEFAULT_MESSAGE
  )}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-[280] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <FaWhatsapp
        size={26}
        strokeWidth={2}
        className="fill-white text-white"
      />
    </Link>
  );
}