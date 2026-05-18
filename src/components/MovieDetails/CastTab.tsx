"use client";
import { Loader2, User } from "lucide-react";
import { useCast } from "@/hooks/useMovie";
import { useLanguage } from "@/context/LanguageContext";
import { getImageUrl } from "@/lib/utils";

interface CastTabProps {
  movieId: string;
}

export function CastTab({ movieId }: CastTabProps) {
  const { t } = useLanguage();
  const { data, isLoading, error } = useCast(movieId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const members = (data?.role || []).map((r) => ({
    id: r._id,
    name: r.name || "",
    image: r.image || "",
    role: r.position || "",
  }));

  if (error || members.length === 0) {
    return null;
    // <div className="py-12 text-center text-neutral-400 text-sm">
    //   {t("noResults") || "No cast available"}
    // </div>
  }

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-medium text-sm xl:text-md 2xl:text-lg">
        {t("cast")}
      </h4>
      <div className="flex gap-4 lg:gap-6 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {members.map((m, i) => (
          <div
            key={m.id || i}
            className="flex-shrink-0 w-32 sm:w-40 lg:w-44 flex flex-col items-center text-center bg-[#262d38] rounded-lg overflow-hidden"
          >
            <div className="relative w-full aspect-square bg-neutral-800 flex items-center justify-center">
              {m.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(m.image)}
                  alt={m.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-neutral-500" />
              )}
            </div>
            <div className="p-2 w-full">
              <p className="text-white font-semibold text-xs sm:text-base line-clamp-1 capitalize">
                {m.name}
              </p>
              {m.role && (
                <p className="text-neutral-400 text-[10px] sm:text-sm mt-0.5 line-clamp-1 capitalize">
                  {m.role}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
