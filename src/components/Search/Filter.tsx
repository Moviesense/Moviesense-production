"use client";

import { ChevronDown, X, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useGenres, useLanguages } from "@/hooks/useMovie";
import { Button } from "../Common/Button";
import { useLanguage } from "@/context/LanguageContext";

export interface FilterSelections {
  year?: string;
  genre?: string;
  language?: string;
  media_type?: string;
}

interface FilterProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selections: FilterSelections) => void;
  initialSelections?: FilterSelections;
}

const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019"];
// const MEDIA_TYPES = [
//   { id: "movie", name: "Movies" },
//   { id: "series", name: "Series" },
//   { id: "tv", name: "TV Shows" },
// ];

type Category = "Year" | "Genre" | "Language" | "Media Type";

export function Filter({
  open,
  onClose,
  onSelect,
  initialSelections,
}: FilterProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("Genre");
  const [selections, setSelections] = useState<FilterSelections>(
    initialSelections || {},
  );

  const { data: genresData, isLoading: isLoadingGenres } = useGenres();
  const { data: languagesData, isLoading: isLoadingLanguages } = useLanguages();
  const { t } = useLanguage();

  const MEDIA_TYPES = [
    { id: "movie", name: t("movies") },
    { id: "tv", name: t("tvShows") },
  ];

  React.useEffect(() => {
    setSelections(initialSelections || {});
  }, [initialSelections]);

  if (!open) return null;

  const handleSelect = (category: Category, id: string) => {
    const newSelections = { ...selections };
    if (category === "Year") newSelections.year = id;
    if (category === "Genre") newSelections.genre = id;
    if (category === "Language") newSelections.language = id;
    if (category === "Media Type") newSelections.media_type = id;

    setSelections(newSelections);
  };

  const categories: Category[] = ["Year", "Genre", "Language", "Media Type"];

  const getOptions = (category: Category = activeCategory) => {
    if (category === "Year") return YEARS.map((y) => ({ id: y, name: y }));
    if (category === "Genre")
      return genresData?.genre.map((g) => ({ id: g._id, name: g.name })) || [];
    if (category === "Language")
      return (
        languagesData?.languages.map((l) => ({ id: l._id, name: l.name })) || []
      );
    if (category === "Media Type") return MEDIA_TYPES;
    return [];
  };

  const getSelectedId = (cat: Category) => {
    if (cat === "Year") return selections.year;
    if (cat === "Genre") return selections.genre;
    if (cat === "Language") return selections.language;
    if (cat === "Media Type") return selections.media_type;
    return null;
  };

  const getSelectedName = (cat: Category) => {
    const id = getSelectedId(cat);
    if (!id) return null;
    const options = getOptions(cat);
    return options.find((o) => o.id === id)?.name || id;
  };

  const isLoading =
    (activeCategory === "Genre" && isLoadingGenres) ||
    (activeCategory === "Language" && isLoadingLanguages);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-manrope">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-background-2/50 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-hidden bg-background/80 border border-white/10 rounded-3xl flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 sm:px-6 md:px-10 md:py-4 border-b border-white/5">
          <h2 className="text-xl md:text-2xl xl:text-3xl font-bold text-white">
            {t("filters")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto">
          {/* CATEGORY TABS */}
          <div className="flex overflow-x-auto pb-4 gap-2 md:gap-4 p-4 sm:px-10">
            {categories.map((cat) => {
              const selectedName = getSelectedName(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 md:gap-6 rounded-full px-6 py-2 border whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-black border-white"
                      : "bg-background/50 text-white border-white/10 hover:border-white/30"
                  }`}
                >
                  <span className="text-xs md:text-sm xl:text-base font-medium">
                    {/* {selectedName || cat} */}
                    {selectedName ||
                      (cat === "Genre"
                        ? t("genre")
                        : cat === "Year"
                          ? t("year")
                          : cat === "Language"
                            ? t("language")
                            : t("mediaType"))}
                  </span>
                  <Chevron rotated={isActive} dark={isActive} />
                </button>
              );
            })}
          </div>

          {/* OPTIONS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 sm:px-10 h-[500px] overflow-y-auto content-start pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              getOptions().map((option) => {
                const isSelected = getSelectedId(activeCategory) === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(activeCategory, option.id)}
                    className={`px-4 py-2 md:px-6 md:py-4 rounded-xl text-xs md:text-sm xl:text-base text-nowrap capitalize font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#25A4AD] text-white border-[#25A4AD] shadow-[0_0_20px_rgba(37,164,173,0.3)]"
                        : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {option.name.toLowerCase()}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-4">
          <Button
            onClick={() => {
              setSelections({});
            }}
            variant="outline"
            className="rounded-full text-nowrap text-white h-10"
          >
            {t("resetAll")}
          </Button>
          <Button
            onClick={() => {
              onSelect(selections);
              onClose();
            }}
            variant="primary"
            className="w-50 h-10"
          >
            {t("applyFilters")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Chevron({ rotated, dark }: { rotated: boolean; dark?: boolean }) {
  return (
    <div
      className={`sm:w-8 sm:h-8 w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
        rotated ? "rotate-180" : ""
      } ${dark ? "bg-black/10" : "bg-white/10"}`}
    >
      <ChevronDown size={18} />
    </div>
  );
}
