
"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface FadeContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  container?: Element | string | null;
  blur?: boolean;
  duration?: number;
  ease?: string;
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
}

const FadeContent: React.FC<FadeContentProps> = ({
  children,
  container,
  blur = false,
  duration = 1000,
  ease = "power2.out",
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = "power2.in",
  onComplete,
  onDisappearanceComplete,
  className = "",
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    let root: Element | null = null;

    if (container instanceof Element) {
      root = container;
    } else {
      const selector =
        typeof container === "string"
          ? container
          : "#snap-main-container";

      root = document.querySelector(selector);
    }

    // Convert millisecond values to seconds, preserving
    // the original component's timing behavior.
    const getSeconds = (value: number) =>
      value > 10 ? value / 1000 : value;

    let hasAnimated = false;
    let isDisposed = false;
    let observer: IntersectionObserver | undefined;
    let animation: gsap.core.Tween | undefined;
    let disappearance: gsap.core.Tween | undefined;
    let disappearanceTimer:
      | ReturnType<typeof setTimeout>
      | undefined;

    const safeThreshold = Math.min(
      1,
      Math.max(0, threshold)
    );

    // Start hidden until the element enters the viewport.
    gsap.set(el, {
      autoAlpha: initialOpacity,
      filter: blur ? "blur(10px)" : "blur(0px)",
      willChange: "opacity, filter",
    });

    const animateIn = () => {
      if (hasAnimated || isDisposed) return;

      hasAnimated = true;

      animation = gsap.to(el, {
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: getSeconds(duration),
        delay: getSeconds(delay),
        ease,
        overwrite: "auto",
        onComplete: () => {
          if (isDisposed) return;

          onComplete?.();

          if (disappearAfter <= 0) {
            gsap.set(el, { clearProps: "willChange" });
            return;
          }

          disappearanceTimer = setTimeout(() => {
            if (isDisposed) return;

            disappearance = gsap.to(el, {
              autoAlpha: initialOpacity,
              filter: blur
                ? "blur(10px)"
                : "blur(0px)",
              duration: getSeconds(disappearDuration),
              ease: disappearEase,
              overwrite: "auto",
              onComplete: () => {
                if (isDisposed) return;

                gsap.set(el, { clearProps: "willChange" });
                onDisappearanceComplete?.();
              },
            });
          }, getSeconds(disappearAfter) * 1000);
        },
      });
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (entry?.isIntersecting) {
            observer?.unobserve(el);
            animateIn();
          }
        },
        {
          root,
          threshold: safeThreshold,
        }
      );

      observer.observe(el);
    } else {
      // Fallback for browsers without IntersectionObserver.
      animateIn();
    }

    return () => {
      isDisposed = true;

      observer?.disconnect();

      if (disappearanceTimer !== undefined) {
        clearTimeout(disappearanceTimer);
      }

      animation?.kill();
      disappearance?.kill();
      gsap.killTweensOf(el);
    };
  }, [
    container,
    blur,
    duration,
    ease,
    delay,
    threshold,
    initialOpacity,
    disappearAfter,
    disappearDuration,
    disappearEase,
    onComplete,
    onDisappearanceComplete,
  ]);

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
};

export default FadeContent;

