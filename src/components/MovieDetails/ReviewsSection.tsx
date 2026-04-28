"use client";

import React, { useEffect, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/Common/Button";
import { Ratings } from "./Ratings";
import { useLanguage } from "@/context/LanguageContext";

interface Review {
  name: string;
  location: string;
  content: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

function getVisibleCount(width: number) {
  if (width >= 768) return 2;
  return 1;
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const { isRTL, t } = useLanguage();
  const [visible, setVisible] = useState(2);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const update = () => {
      setVisible(getVisibleCount(window.innerWidth));
      setPage(0);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const step = Math.floor(visible);
  const totalPages = Math.max(1, Math.ceil(reviews.length / step));
  const maxPage = totalPages - 1;

  const prev = () => setPage((p) => Math.max(p - 1, 0));
  const next = () => setPage((p) => Math.min(p + 1, maxPage));

  return (
    <div className="bg-zinc-900 p-4 sm:p-6 md:p-8 rounded-xl border border-neutral-800 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-neutral-400 text-sm sm:text-base">
          {t("reviews")}
        </h3>

        <Button
          variant="custom"
          className="px-4 py-2 border border-neutral-800 rounded-lg hover:bg-zinc-800 transition-colors text-sm sm:text-base w-full sm:w-auto"
          leftIcon={<Plus size={18} />}
          size="md"
        >
          {t("addReview")}
        </Button>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex gap-4 sm:gap-6 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${isRTL ? "" : "-"}${(page * 100) / visible}%)`,
          }}
        >
          {reviews.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0"
              style={{
                width: `calc((100% - ${
                  (visible - 1) * (window.innerWidth < 768 ? 16 : 24)
                }px) / ${visible})`,
              }}
            >
              <div className="bg-stone-950 p-4 sm:p-6 rounded-xl border border-neutral-800 h-full">
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="min-w-0">
                    <h4 className="text-lg sm:text-xl font-medium truncate">
                      {review.name}
                    </h4>
                    <p className="text-neutral-400 text-xs sm:text-sm">
                      {review.location}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Ratings ratings={[{ value: 4.5 }]} />
                  </div>
                </div>
                <p className="mt-3 sm:mt-4 text-neutral-400 text-sm sm:text-base line-clamp-4 sm:line-clamp-none">
                  {review.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center w-full gap-2 sm:gap-3">
        <Button
          variant="custom"
          onClick={isRTL ? next : prev}
          disabled={isRTL ? page === maxPage : page === 0}
          className="p-2 sm:p-3 rounded-full border border-neutral-800 bg-stone-950 hover:bg-zinc-800 transition-colors disabled:opacity-40"
        >
          {isRTL ? (
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          ) : (
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
          )}
        </Button>

        {/* DOTS (Hidden on very small screens) */}
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              onClick={() => setPage(i)}
              className={`h-1.5 rounded-full cursor-pointer transition-all border-none shadow-none p-0 ${
                page === i
                  ? "w-4 bg-[#25A4AD]"
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        <Button
          variant="custom"
          onClick={isRTL ? prev : next}
          disabled={isRTL ? page === 0 : page === maxPage}
          className="p-2 sm:p-3 rounded-full border border-neutral-800 bg-stone-950 hover:bg-zinc-800 transition-colors disabled:opacity-40"
        >
          {isRTL ? (
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
          ) : (
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
