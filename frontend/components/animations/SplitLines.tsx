"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

export interface SplitLinesProps {
  tag?: keyof React.JSX.IntrinsicElements;
  text: string;
  className?: string;
  duration?: number;
  stagger?: number;
  ease?: string;
  yPercent?: number;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

export const SplitLines: React.FC<SplitLinesProps> = ({
  tag: Tag = "p",
  text,
  className = "",
  duration = 1,
  stagger = 0.1,
  ease = "power3.out",
  yPercent = 100,
  threshold = 0.1,
  rootMargin = "0px 0px -100px 0px",
  delay = 0,
}) => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const element = containerRef.current;

      if (!element) return;

      // Create the line masks
      const outerSplit = new SplitText(element, {
        type: "lines",
        linesClass: "split-outer",
      });

      // Create the animated lines
      const innerSplit = new SplitText(outerSplit.lines, {
        type: "lines",
        linesClass: "split-inner",
      });

      // Hide anything outside each line
      gsap.set(outerSplit.lines, {
        overflow: "hidden",
      });

      // Start lines below their masks
      gsap.set(innerSplit.lines, {
        yPercent,
      });

      const animateIn = () => {
        gsap.to(innerSplit.lines, {
          yPercent: 0,
          duration,
          stagger,
          ease,
          delay,
          overwrite: true,
        });
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          animateIn();

          observer.disconnect();
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();

        gsap.killTweensOf(innerSplit.lines);

        innerSplit.revert();
        outerSplit.revert();
      };
    },
    {
      scope: containerRef,
      dependencies: [
        text,
        duration,
        stagger,
        ease,
        yPercent,
        threshold,
        rootMargin,
        delay,
      ],
    }
  );

  const Component = Tag as React.ElementType;

  return (
    <Component ref={containerRef} className={className}>
      {text}
    </Component>
  );
};