"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className
}) => {
  const containerRef = React.useRef(null);
  const scrollerRef = React.useRef(null);

  useEffect(() => {
    addAnimation();
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}>
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-6 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}>
        {items.map((item, idx) => (
          <li
            className="relative w-[280px] sm:w-[320px] md:w-[380px] lg:w-[420px] max-w-full shrink-0 rounded-3xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0A0A0A] px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8 group hover:border-[#D4AF76]/30 transition-all duration-500 shadow-lg hover:shadow-2xl"
            key={`${item.name}-${idx}`}>
            <div className="relative">
              {/* Quote Icon */}
              <div className="mb-3 sm:mb-4 md:mb-6">
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>

              <blockquote>
                {/* Quote Text */}
                <p className="relative z-20 text-gray-700 dark:text-gray-300 font-light leading-relaxed text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-6">
                  "{item.quote}"
                </p>

                {/* Rating */}
                {item.rating && (
                  <div className="flex items-center gap-0.5 sm:gap-1 mb-3 sm:mb-4 md:mb-6">
                    {[...Array(item.rating)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#D4AF76]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}

                {/* Customer Info */}
                <div className="relative z-20 flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0 rounded-full bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] flex items-center justify-center text-white font-light text-sm sm:text-base md:text-lg shadow-lg">
                    {item.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block font-light text-[#2C2C2C] dark:text-gray-100 text-sm sm:text-base md:text-lg group-hover:text-[#D4AF76] transition-colors truncate">
                      {item.name}
                    </span>
                    <span className="block text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 font-light mb-0.5 sm:mb-1 truncate">
                      {item.title}
                    </span>
                    {item.purchase && (
                      <span className="block text-[10px] sm:text-xs text-[#D4AF76] font-light truncate">
                        Purchased: {item.purchase}
                      </span>
                    )}
                  </div>
                </div>
              </blockquote>

              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" className="text-[#D4AF76]"/>
                  <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" className="text-[#D4AF76]"/>
                </svg>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
