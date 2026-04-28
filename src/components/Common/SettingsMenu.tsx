import React, { useState } from "react";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QualityLevel {
  index: number;
  label: string;
  height?: number;
}

interface SettingsMenuProps {
  qualityLevels: QualityLevel[];
  currentQualityIndex: number;
  onQualitySelect: (index: number) => void;
  playbackSpeed: number;
  onPlaybackSpeedSelect: (speed: number) => void;
  onClose: () => void;
}

type MenuState = "main" | "quality" | "speed";

export function SettingsMenu({
  qualityLevels,
  currentQualityIndex,
  onQualitySelect,
  playbackSpeed,
  onPlaybackSpeedSelect,
  onClose,
}: SettingsMenuProps) {
  const [menuState, setMenuState] = useState<MenuState>("main");

  const currentQualityLabel =
    currentQualityIndex === -1
      ? "Auto"
      : qualityLevels.find((l) => l.index === currentQualityIndex)?.label ||
        "Auto";

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="absolute bottom-16 right-4 sm:right-8 bg-black/90 border border-white/20 rounded-lg shadow-xl overflow-hidden min-w-[220px] z-50 animate-in fade-in slide-in-from-bottom-2">
      {menuState === "main" && (
        <div className="py-2">
          <div className="p-3 border-b border-white/10 mb-1">
            <h3 className="text-white font-medium text-sm">Settings</h3>
          </div>
          <button
            onClick={() => setMenuState("quality")}
            className="w-full px-4 py-3 cursor-pointer text-left text-sm hover:bg-white/10 flex items-center justify-between transition-colors group"
          >
            <div className="flex flex-col">
              <span className="text-white font-medium">Quality</span>
              <span className="text-gray-400 text-xs">
                {currentQualityLabel}
              </span>
            </div>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-white transition-colors"
            />
          </button>
          <button
            onClick={() => setMenuState("speed")}
            className="w-full px-4 py-3 cursor-pointer text-left text-sm hover:bg-white/10 flex items-center justify-between transition-colors group"
          >
            <div className="flex flex-col">
              <span className="text-white font-medium">Playback Speed</span>
              <span className="text-gray-400 text-xs">
                {playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`}
              </span>
            </div>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-white transition-colors"
            />
          </button>
        </div>
      )}

      {menuState === "quality" && (
        <div className="py-2">
          <div className="px-2 py-1 border-b border-white/10 mb-1 flex items-center">
            <button
              onClick={() => setMenuState("main")}
              className="p-2 hover:bg-white/10 cursor-pointer rounded-full text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-white font-medium text-sm ml-1">Quality</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {/* Auto Option */}
            <button
              onClick={() => {
                onQualitySelect(-1);
                onClose();
              }}
              className={cn(
                "w-full px-4 py-3 text-left text-sm hover:bg-white/10 flex items-center justify-between transition-colors",
                currentQualityIndex === -1 ? "text-white" : "text-gray-400",
              )}
            >
              <span>Auto</span>
              {currentQualityIndex === -1 && (
                <Check size={16} className="text-red-600" />
              )}
            </button>

            {/* Quality Levels */}
            {qualityLevels.map((level) => (
              <button
                key={level.index}
                onClick={() => {
                  onQualitySelect(level.index);
                  onClose();
                }}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm cursor-pointer hover:bg-white/10 flex items-center justify-between transition-colors",
                  currentQualityIndex === level.index
                    ? "text-white"
                    : "text-gray-400",
                )}
              >
                <span>{level.label}</span>
                {currentQualityIndex === level.index && (
                  <Check size={16} className="text-red-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {menuState === "speed" && (
        <div className="py-2">
          <div className="px-2 py-1 border-b border-white/10 mb-1 flex items-center">
            <button
              onClick={() => setMenuState("main")}
              className="p-2 hover:bg-white/10 cursor-pointer rounded-full text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-white font-medium text-sm ml-1">
              Playback Speed
            </h3>
          </div>
          <div className="max-h-100 overflow-y-auto">
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  onPlaybackSpeedSelect(speed);
                  onClose();
                }}
                className={cn(
                  "w-full px-4 py-3 cursor-pointer text-left text-sm hover:bg-white/10 flex items-center justify-between transition-colors",
                  playbackSpeed === speed ? "text-white" : "text-gray-400",
                )}
              >
                <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
                {playbackSpeed === speed && (
                  <Check size={16} className="text-red-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
