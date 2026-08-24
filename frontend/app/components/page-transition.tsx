"use client";

import { useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [displayedChildren, setDisplayedChildren] = useState(children);

  const isFirstRender = useRef(true);
  const prevPathname = useRef(pathname);
  const isNavigating = useRef(false);

  const revealTimeline = useCallback(() => {
    gsap.timeline({
      onComplete: () => {
        gsap.set(overlayRef.current, { pointerEvents: "none" });
        isNavigating.current = false;
      },
    }).to(overlayRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      delay: 0.15,
    });
  }, []);

  const coverTimeline = useCallback((onCovered?: () => void) => {
    gsap.set(overlayRef.current, { pointerEvents: "auto", opacity: 0 });
    gsap.set(contentRef.current, { opacity: 0, y: 14 });

    gsap
      .timeline()
      .to(overlayRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.inOut",
      })
      .to(
        contentRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
        },
        "-=0.1"
      )
      .call(() => onCovered?.());
  }, []);

  // Intercept internal link clicks BEFORE Next.js navigates
  useGSAP(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      const isInternal = href.startsWith("/") && !href.startsWith("//");
      const isModifiedClick =
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
      const isNewTab = link.target === "_blank";
      const isDownload = link.hasAttribute("download");
      const isSameUrl = href === pathname;

      if (
        !isInternal ||
        isModifiedClick ||
        isNewTab ||
        isDownload ||
        isSameUrl ||
        isNavigating.current
      ) {
        return;
      }

      e.preventDefault();
      isNavigating.current = true;

      coverTimeline(() => {
        router.push(href);
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname, router, coverTimeline]);

  // Fires once the new route has actually rendered
  useGSAP(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPathname.current = pathname;
      setDisplayedChildren(children);
      return;
    }

    if (prevPathname.current === pathname) {
      setDisplayedChildren(children);
      return;
    }

    prevPathname.current = pathname;
    setDisplayedChildren(children);

    if (isNavigating.current) {
      requestAnimationFrame(() => revealTimeline());
    } else {
      coverTimeline(() => revealTimeline());
    }
  }, [pathname, children]);

  return (
    <>
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[500] flex items-center justify-center bg-black opacity-0"
      >
        <div ref={contentRef} className="flex flex-col items-center gap-6">
          <div className="relative h-[48px] w-[140px] sm:h-[56px] sm:w-[170px]">
            <Image
              src="https://res.cloudinary.com/datpkisht/image/upload/v1785710402/sds4vkihn8zuole2h8ud.jpg"
              alt="Bencord"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="h-[3px] w-40 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-[loading-slide_1.1s_ease-in-out_infinite] rounded-full bg-[#ff0000]" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
      `}</style>

      {displayedChildren}
    </>
  );
}