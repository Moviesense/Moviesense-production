"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/Common/Button";
import { getImageUrl } from "@/lib/utils";
import Image from "next/image";

interface CastMember {
  name: string;
  image: string;
}

interface CastSectionProps {
  cast: CastMember[];
}

function getVisibleCount(width: number) {
  if (width >= 1024) return 8;
  if (width >= 768) return 4;
  if (width >= 640) return 2;
  return 2;
}

export function CastSection({ cast }: CastSectionProps) {
  const { isRTL, t } = useLanguage();
  const [visible, setVisible] = useState(8);
  const [page, setPage] = useState(0);
  const [gap, setGap] = useState(16);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setVisible(getVisibleCount(width));
      setGap(width < 640 ? 12 : 16);
      setPage(0);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const step = Math.floor(visible);
  const totalPages = Math.max(1, Math.ceil(cast.length / step));
  const maxPage = totalPages - 1;

  const prev = () => setPage((p) => Math.max(p - 1, 0));
  const next = () => setPage((p) => Math.min(p + 1, maxPage));

  return (
    <div className="bg-zinc-900 p-4 sm:p-6 md:p-8 rounded-xl border border-neutral-800">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="text-neutral-400 text-sm sm:text-base">{t("cast")}</h3>
        <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg">
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

      <div className="relative overflow-hidden">
        <div
          className="flex gap-3 sm:gap-4 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(${isRTL ? "" : "-"}${page} * (100% + var(--gap, 12px))))`,
          }}
        >
          {cast.map((member, i) => {
            return (
              <div
                key={i}
                className="flex-shrink-0"
                style={{
                  width: `calc((100% - ${(visible - 1) * gap}px) / ${visible})`,
                  ["--gap" as any]: `${gap}px`,
                }}
              >
                <Image
                  width={100}
                  height={100}
                  src={getImageUrl(member.image)}
                  alt={member.name}
                  className="rounded-lg sm:rounded-xl w-full h-auto object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
