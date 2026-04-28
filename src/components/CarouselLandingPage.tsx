"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/Common/Button";
import { getImageUrl } from "@/lib/utils";

interface SlideItem {
  image?: string;
  title?: string;
  subtitle?: string;
}

interface CarouselProps {
  slides: SlideItem[];
  autoPlay?: boolean;
  interval?: number;
  height?: string;
  onFinish?: () => void;
}

export default function Carousel({
  slides,
  autoPlay = true,
  interval = 3000,
  height = "h-[400px]",
  onFinish,
}: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  /* Auto Slide */
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [current, autoPlay, interval, slides.length]);

  const nextSlide = () => {
    if (current < slides.length - 1) {
      setCurrent((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (current > 0) {
      setCurrent((prev) => prev - 1);
    }
  };

  /* Touch Swipe */
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    if (startX.current - endX > 50) nextSlide();
    if (endX - startX.current > 50) prevSlide();
  };

  return (
    <div className={`relative w-full overflow-hidden ${height}`}>
      {/* GRADIENT OVERLAY (FIXED) */}
      {/* <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-neutral-900/0 via-neutral-900/40 to-neutral-900" /> */}

      {/* Slider */}
      <div
        ref={sliderRef}
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`min-w-full flex flex-col justify-center items-center text-center px-4 ${height}`}
          >
            {/* Image */}
            {slide.image && (
              <div className="relative w-full max-w-[300px] sm:max-w-[400px] aspect-square">
                <Image
                  src={getImageUrl(slide.image)}
                  fill
                  alt={slide.title || ""}
                  className="object-contain"
                />
              </div>
            )}

            {/* Title */}
            {slide.title && (
              <h2 className="text-white text-3xl sm:text-5xl font-bold mt-4 sm:mt-0">
                {slide.title}
              </h2>
            )}

            {/* Subtitle */}
            {slide.subtitle && (
              <p className="mt-2 text-white/80 text-lg sm:text-3xl max-w-2xl mt-[10px] sm:mt-[20px]">
                {slide.subtitle}
              </p>
            )}

            {/* GET STARTED BUTTON (LAST SLIDE ONLY) */}
            {index === slides.length - 1 && (
              <Button
                variant="custom"
                className="mt-6 sm:mt-10 px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 font-medium text-base sm:text-lg border-none shadow-none"
                onClick={onFinish}
              >
                Get Started
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* LEFT ARROW (HIDDEN ON FIRST SLIDE) */}
      {current > 0 && (
        <div
          onClick={prevSlide}
          className="absolute cursor-pointer left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 rounded-full hover:bg-black/60 border-none shadow-none p-0 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center"
        >
          <Image
            src="/images/left-arrow.png"
            width={30}
            height={30}
            alt=""
            className="w-10 h-10 sm:w-14 sm:h-14"
          />
        </div>
      )}

      {/* RIGHT ARROW (HIDDEN ON LAST SLIDE) */}
      {current < slides.length - 1 && (
        <div
          onClick={nextSlide}
          className="absolute cursor-pointer right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 rounded-full hover:bg-black/60 border-none shadow-none p-0 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center"
        >
          <Image
            src="/images/right-arrow.png"
            width={30}
            height={30}
            alt=""
            className="w-10 h-10 sm:w-14 sm:h-14"
          />
        </div>
      )}

      {/* DOTS */}
      {/* DOTS */}
      <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center gap-3">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-3 rounded-full transition-all cursor-pointer duration-300 border-none shadow-none p-0 ${
              current === index ? "w-8 bg-[#25A4AD]" : "w-3 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
