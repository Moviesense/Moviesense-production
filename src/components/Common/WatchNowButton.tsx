"use client";

import React from "react";
import { Play, Loader2, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { IconButton } from "./IconButton";

interface WatchNowButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  title: string;
  subtitle?: string;
  className?: string;
  showIsFav?: boolean;
  disabled?: boolean;
  isFav?: boolean;
  onFavClick?: () => void;
  isRent?: boolean;
}

export function WatchNowButton({
  onClick,
  isLoading = false,
  title,
  subtitle,
  className,
  showIsFav = false,
  disabled,
  isFav,
  onFavClick,
  isRent,
}: WatchNowButtonProps) {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "flex items-center sm:gap-4 mb-5 mt-1",
        showIsFav
          ? "opacity-100 sm:opacity-100 w-full justify-center sm:justify-start px-2 sm:px-0 gap-2 sm:mb-0 xl:mt-2"
          : "opacity-100 mb-2",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={cn(
          "group/media-btn flex items-center sm:w-auto sm:gap-3 bg-white/10 text-white sm:backdrop-blur-[50px] rounded-full justify-center pe-2 sm:pe-0 sm:justify-start sm:pe-6 sm:ps-0 py-0 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-secondary sm:bg-white/5 sm:bg-gradient-to-r sm:from-white/15 sm:to-white/15",
          className,
          showIsFav ? "w-[50%]" : "w-85",
        )}
      >
        <span className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full md:h-[40px] md:w-[40px] xl:h-[50px] xl:w-[50px] 2xl:h-[60px] 2xl:w-[60px] sm:bg-gradient-to-r sm:from-primary sm:to-secondary sm:group-hover/media-btn:to-primary transition-all">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : isRent ? (
            <Plus className="w-5 h-5 xl:w-7 xl:h-7 text-white" />
          ) : (
            <Play className="w-5 h-5 xl:w-7 xl:h-7 fill-white text-white" />
          )}
        </span>
        <span className="flex flex-col justify-center whitespace-nowrap text-start gap-1 py-0">
          <span
            className={`font-bold leading-tight text-white text-xs sm:text-sm xl:text-base ${subtitle ? "hidden sm:block" : ""}`}
          >
            {title}
          </span>
          {subtitle && (
            <span className="text-xs text-white font-bold sm:font-normal sm:text-neutral-400">
              {subtitle}
            </span>
          )}
        </span>
        {showIsFav && (
          <span className="hidden sm:flex">
            <IconButton
              title={t("myList")}
              onClick={(e) => {
                e.stopPropagation();
                onFavClick?.();
              }}
              className="h-[26px] w-[26px] xl:h-[35px] xl:w-[35px] ms-2"
            >
              {isFav ? <Check size={18} /> : <Plus size={18} />}
            </IconButton>
          </span>
        )}
      </button>
      {showIsFav && (
        <span
          className="flex items-center h-8 sm:h-9 w-[50%] justify-center gap-2 rounded-full w-100 text-nowrap sm:hidden border-gradient from-primary to-secondary"
          onClick={(e) => {
            e.stopPropagation();
            onFavClick?.();
          }}
        >
          <span className="font-bold">
            {isFav ? <Check size={18} /> : <Plus size={18} />}
          </span>
          <span className="text-xs font-bold">{t("myList")}</span>
        </span>
      )}
    </div>
  );
}
