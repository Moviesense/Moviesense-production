"use client";

import { useWidgetData } from "@/hooks/useHome";
import { MovieRow } from "./MovieRow";
import { Widget } from "@/types/setting";
import { useLanguage } from "@/context/LanguageContext";

interface WidgetRowProps {
  widget: Widget;
  isSettingsLoading: boolean;
}

export function WidgetRow({ widget, isSettingsLoading }: WidgetRowProps) {
  const { data: widgetData, isLoading } = useWidgetData(widget._id);
  const { language } = useLanguage();

  const items =
    widgetData?.series?.map((item: any) => ({
      id: item._id,
      image: item.thumbnail || item.image || item.poster || "/images/movie.png",
      duration: item.duration,
      views: item.view || item.views,
      title: language == "ar" ? item.arabicTitle : item.title,
      description: item.description,
      year: item.year ? new Date(item.year).getFullYear() : undefined,
      genres: item.genres || item.genre,
      freeEpisode: item?.firstEpisode?.type == "FREE" ? true : false,
      mediaType: item.media_type || item.type,
      totalLikes: item.totalLikes,
      likeStatus: item.likeStatus,
      isFavorite: item.isFavorite,
      type: item.type,
      isRented: item.isRented,
      expiryDate: item.expiryDate,
      clicksLeft: item.clicksLeft,
    })) || [];

  // if (!isLoading && !isSettingsLoading && items.length === 0) {
  //   return null;
  // }

  return (
    // ps-2 sm:ps-6 lg:ps-10 xl:ps-16
    // mb-8 sm:mb-10 xl:mb-16
    <div className="mb-0 xl:mb-10">
      {/* <h2 className="text-white text-sm sm:text-xl xl:text-2xl font-medium mb-0 ps-2 sm:ps-6 lg:ps-10 xl:ps-16">
        {widget.title}
      </h2> */}

      {isLoading || isSettingsLoading ? (
        <div className="flex gap-1 overflow-hidden mt-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="w-30 xl:w-80 aspect-[2.5/4.2] xl:aspect-[7/4] skeleton-card rounded-lg flex-shrink-0 bg-background"
              />
            ))}
        </div>
      ) : (
        <MovieRow
          title={language == "ar" ? widget.arabicTitle : widget.title}
          items={items}
          hideTitle={false}
        />
      )}
    </div>
  );
}
