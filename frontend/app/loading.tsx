"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        <div className="relative block h-[36px] w-[105px] sm:h-[40px] sm:w-[115px] lg:h-[56px] lg:w-[170px] shrink-0">
          <Image
            src="https://res.cloudinary.com/datpkisht/image/upload/v1785710402/sds4vkihn8zuole2h8ud.jpg"
            alt="Bencord"
            fill
            priority
            quality={100}
            className="object-cover"
          />
        </div>

        <div className="h-[3px] w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[loading-slide_1.1s_ease-in-out_infinite] rounded-full bg-[#ff0000]" />
        </div>
      </div>

      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}