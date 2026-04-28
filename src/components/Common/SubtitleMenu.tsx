import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Subtitle } from "@/types/movie";
import { useLanguage } from "@/context/LanguageContext";

interface SubtitleMenuProps {
  subtitles: Subtitle[];
  selectedSubtitleId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}

export function SubtitleMenu({
  subtitles,
  selectedSubtitleId,
  onSelect,
  onClose,
}: SubtitleMenuProps) {
  const { t } = useLanguage();
  return (
    <div className="absolute bottom-16 right-4 sm:right-8 bg-black/90 border border-white/20 rounded-lg shadow-xl overflow-hidden min-w-[200px] z-50 animate-in fade-in slide-in-from-bottom-2">
      <div className="p-3 border-b border-white/10">
        <h3 className="text-white font-medium text-sm">{t("subtitles")}</h3>
      </div>
      <div className="max-h-60 overflow-y-auto py-2">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "w-full px-4 py-2 text-start text-sm hover:bg-white/10 flex items-center justify-between transition-colors",
            selectedSubtitleId === null ? "text-white" : "text-gray-400",
          )}
        >
          <span>{t("off")}</span>
          {selectedSubtitleId === null && (
            <Check size={16} className="text-red-600" />
          )}
        </button>
        {subtitles.map((sub) => (
          <button
            key={sub._id}
            onClick={() => onSelect(sub._id)}
            className={cn(
              "w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center justify-between transition-colors",
              selectedSubtitleId === sub._id ? "text-white" : "text-gray-400",
            )}
          >
            <span>{sub.language.name}</span>
            {selectedSubtitleId === sub._id && (
              <Check size={16} className="text-red-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
