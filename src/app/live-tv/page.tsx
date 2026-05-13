"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLiveTV } from "@/hooks/useLiveTV";
import { Loader } from "@/components/Common/Loader";
import { Header } from "@/components/HomePage/Header";
import {
  format,
  parse,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addDays,
  isSameDay,
  differenceInMinutes,
  max as dateMax,
  min as dateMin,
} from "date-fns";
import Hls from "hls.js";
import { Program, ProgramGuideRow } from "@/types/liveTV";
import { Calendar, Eye, Loader2, Maximize, Radio } from "lucide-react";
import { useInView } from "react-intersection-observer";

const HOURS = 24;

const SCALES = {
  mobile: { pxPerHour: 120, channelCol: 84, rowHeight: 96, headerHeight: 40 },
  tablet: { pxPerHour: 200, channelCol: 170, rowHeight: 100, headerHeight: 44 },
  desktop: {
    pxPerHour: 240,
    channelCol: 220,
    rowHeight: 112,
    headerHeight: 48,
  },
};

type Scale = (typeof SCALES)[keyof typeof SCALES];

function useResponsiveScale(): Scale {
  const [scale, setScale] = useState<Scale>(SCALES.desktop);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) setScale(SCALES.mobile);
      else if (w < 1024) setScale(SCALES.tablet);
      else setScale(SCALES.desktop);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return scale;
}

function VideoComponent({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (!document.fullscreenElement) {
        await video.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore — some browsers reject if user gesture missing.
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <div className="relative w-full h-full bg-black group">
      <video
        ref={videoRef}
        controls={isFullscreen}
        onClick={isFullscreen ? undefined : togglePlay}
        className="w-full h-full object-cover"
      />
      {!isFullscreen && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          aria-label="Enter full screen"
          className="absolute bottom-4 sm:bottom-6 lg:bottom-8 right-4 sm:right-8 lg:right-14 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white p-2 sm:p-2.5 rounded-lg transition-colors cursor-pointer"
        >
          <Maximize size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      )}
    </div>
  );
}

const DATE_FMT = "yyyy-MM-dd";

function parseApiDate(dateStr: string): Date {
  return parse(dateStr, DATE_FMT, new Date());
}

function dateLabel(dateStr: string, now: Date): string {
  const d = parseApiDate(dateStr);
  if (isSameDay(d, now)) return "Today";
  if (isSameDay(d, addDays(now, 1))) return "Tomorrow";
  return format(d, "EEEE");
}

function clipProgramToDay(
  program: Program,
  dayStart: Date,
  dayEnd: Date,
  pxPerMinute: number,
) {
  const start = parseISO(program.start);
  const end = parseISO(program.end);
  if (end <= dayStart || start >= dayEnd) return null;
  const clippedStart = dateMax([start, dayStart]);
  const clippedEnd = dateMin([end, dayEnd]);
  const offsetMin = differenceInMinutes(clippedStart, dayStart);
  const widthMin = Math.max(differenceInMinutes(clippedEnd, clippedStart), 15);
  return {
    program,
    leftPx: offsetMin * pxPerMinute,
    widthPx: widthMin * pxPerMinute,
    realStart: start,
    realEnd: end,
  };
}

interface HoveredProgram {
  program: Program;
  anchor: DOMRect;
  realStart: Date;
  realEnd: Date;
  isLive: boolean;
}

function ProgramTooltip({ data }: { data: HoveredProgram }) {
  const { program, anchor, realStart, realEnd, isLive } = data;
  const tooltipWidth = 280;
  const margin = 8;

  // Center horizontally over anchor; clamp to viewport.
  let left = anchor.left + anchor.width / 2 - tooltipWidth / 2;
  if (left < margin) left = margin;
  if (left + tooltipWidth > window.innerWidth - margin) {
    left = window.innerWidth - tooltipWidth - margin;
  }

  // Prefer below; flip above if not enough room.
  const spaceBelow = window.innerHeight - anchor.bottom;
  const placeAbove = spaceBelow < 180;
  const top = placeAbove ? anchor.top - margin : anchor.bottom + margin;

  return (
    <div
      role="tooltip"
      style={{
        position: "fixed",
        left,
        top,
        width: tooltipWidth,
        transform: placeAbove ? "translateY(-100%)" : undefined,
        zIndex: 9999,
      }}
      className="bg-[#0b0d12]/98 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-2xl pointer-events-none animate-in fade-in duration-100"
    >
      <div className="flex items-center gap-2 text-[11px] text-white/60">
        {isLive && (
          <span className="bg-[#E41932] text-white px-1.5 py-px rounded text-[9px] font-bold tracking-wider">
            ON NOW
          </span>
        )}
        <span>
          {format(realStart, "HH:mm")} - {format(realEnd, "HH:mm")}
        </span>
      </div>
      <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
        {program.title}
      </h4>
      {program.description && (
        <p className="text-xs text-white/70 mt-2 leading-relaxed">
          {program.description}
        </p>
      )}
    </div>
  );
}

export default function LiveTVPage() {
  const {
    liveList,
    selectedStreamId,
    setSelectedStreamId,
    streamDetails,
    streamUnavailable,
    programDate,
    setProgramDate,
    guide,
    guideLoading,
    loadingMore,
    loadMoreOtherStreams,
    loading,
    error,
  } = useLiveTV();

  const scale = useResponsiveScale();
  const { pxPerHour, channelCol, rowHeight, headerHeight } = scale;
  const pxPerMinute = pxPerHour / 60;
  const totalGridWidth = HOURS * pxPerHour;

  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [hoveredProgram, setHoveredProgram] = useState<HoveredProgram | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didAutoScrollRef = useRef(false);
  const lastNowRef = useRef<Date | null>(null);

  // Mount flag for portal (avoid SSR access to document).
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tick "now" every minute.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Hide tooltip when EPG scrolls horizontally or window resizes —
  // anchor rect would otherwise become stale.
  useEffect(() => {
    const el = scrollRef.current;
    const clear = () => setHoveredProgram(null);
    el?.addEventListener("scroll", clear, { passive: true });
    window.addEventListener("resize", clear);
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      el?.removeEventListener("scroll", clear);
      window.removeEventListener("resize", clear);
      window.removeEventListener("scroll", clear);
    };
  }, []);

  const todayStr = useMemo(() => format(now, DATE_FMT), [now]);
  const activeDateStr = guide?.selectedDate ?? programDate ?? todayStr;
  const activeDate = useMemo(
    () => parseApiDate(activeDateStr),
    [activeDateStr],
  );
  const availableDates = useMemo<string[]>(() => {
    const apiDates = guide?.dates ?? [];
    if (apiDates.length > 0) return apiDates;
    return [todayStr];
  }, [guide?.dates, todayStr]);

  const dayStart = useMemo(() => startOfDay(activeDate), [activeDate]);
  const dayEnd = useMemo(() => endOfDay(activeDate), [activeDate]);
  const isToday = isSameDay(activeDate, now);

  // Build EPG rows: highlighted channel first, then paginated others.
  const channelRows = useMemo<ProgramGuideRow[]>(() => {
    if (!guide) return [];
    const rows: ProgramGuideRow[] = [];
    if (guide.programs.currentStream) rows.push(guide.programs.currentStream);
    if (guide.programs.otherStreams) rows.push(...guide.programs.otherStreams);
    return rows;
  }, [guide]);

  // Reset auto-scroll when active date, channel, or scale changes.
  useEffect(() => {
    didAutoScrollRef.current = false;
    lastNowRef.current = null;
  }, [activeDateStr, pxPerHour, selectedStreamId]);

  const timeline = useMemo(
    () =>
      Array.from({ length: HOURS }).map((_, i) => {
        const d = new Date(dayStart.getTime() + i * 60 * 60 * 1000);
        return { hour: i, label: format(d, "HH:mm") };
      }),
    [dayStart],
  );

  // Snap once programs for the highlighted channel are loaded.
  useEffect(() => {
    if (!isToday || didAutoScrollRef.current) return;
    if (!scrollRef.current) return;
    const programs = guide?.programs.currentStream?.programs;
    if (!programs) return;

    const live = programs.find((p) => {
      const start = parseISO(p.start);
      const end = parseISO(p.end);
      return now >= start && now <= end;
    });
    const targetPx = live
      ? differenceInMinutes(parseISO(live.start), dayStart) * pxPerMinute
      : differenceInMinutes(now, dayStart) * pxPerMinute;

    scrollRef.current.scrollLeft = Math.max(0, targetPx - 8);
    didAutoScrollRef.current = true;
    lastNowRef.current = now;
  }, [
    isToday,
    now,
    dayStart,
    guide?.programs.currentStream?.programs,
    pxPerMinute,
  ]);

  // Tick-follow: keep now-line in same screen position as time advances.
  useEffect(() => {
    if (!isToday || !scrollRef.current) return;
    const last = lastNowRef.current;
    if (!last) return;
    const deltaMin = differenceInMinutes(now, last);
    if (deltaMin > 0) {
      scrollRef.current.scrollLeft += deltaMin * pxPerMinute;
      lastNowRef.current = now;
    }
  }, [now, isToday, pxPerMinute, guide?.programs.currentStream?.programs]);

  // Infinite-scroll sentinel for `otherStreams`.
  const { ref: sentinelRef, inView: sentinelInView } = useInView({
    rootMargin: "200px 0px",
  });
  useEffect(() => {
    if (sentinelInView) loadMoreOtherStreams();
  }, [sentinelInView, loadMoreOtherStreams]);

  if (loading) return <Loader />;

  const currentStream =
    liveList.find((s) => s._id === selectedStreamId) || liveList[0];
  const currentRow = guide?.programs.currentStream;
  const activePrograms = currentRow?.programs ?? [];
  const activeProgram = activePrograms.find((p) =>
    isWithinInterval(now, { start: parseISO(p.start), end: parseISO(p.end) }),
  );

  const heroChannelName =
    streamDetails?.stream?.channelName ||
    currentRow?.channelName ||
    currentStream?.title;
  const heroLogo =
    streamDetails?.stream?.streamIcon ||
    currentRow?.streamIcon ||
    streamDetails?.stream?.thumbnail ||
    currentRow?.channelThumbnail ||
    currentStream?.thumbnail ||
    "https://placehold.co/160x90";
  const heroPoster =
    streamDetails?.stream?.thumbnail ||
    currentRow?.channelThumbnail ||
    currentStream?.thumbnail ||
    "https://placehold.co/1920x1080";

  const nowLeftPx = differenceInMinutes(now, dayStart) * pxPerMinute;

  return (
    <main className="min-h-screen text-white bg-background-2">
      <Header />

      {/* HERO / PLAYER */}
      <section className="relative h-[40vh] sm:h-[55vh] md:h-[65vh] lg:h-[78vh] xl:h-[86vh] bg-black mt-[8rem] lg:mt-0">
        {streamUnavailable ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 text-white px-4 text-center">
            <span className="text-xl sm:text-2xl md:text-3xl font-semibold">
              Stream no longer available
            </span>
            <span className="text-xs sm:text-sm text-white/60">
              Please pick another channel below.
            </span>
          </div>
        ) : streamDetails?.stream?.streamURL ? (
          <VideoComponent src={streamDetails.stream.streamURL} />
        ) : (
          <img
            src={heroPoster}
            alt={heroChannelName || "Live"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#070707] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-24 sm:h-32 lg:h-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-[5]" />

        <div className="absolute top-16 sm:top-20 md:top-24 left-3 sm:left-6 lg:left-14 bg-black/50 backdrop-blur-md border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 text-xs sm:text-sm">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FFB133]" />
          <span className="text-white/80">Free Preview</span>
        </div>

        <div className="absolute bottom-0 w-full px-3 sm:px-6 lg:px-14 pb-4 sm:pb-6 lg:pb-8">
          <div className="flex items-end gap-3 sm:gap-4 lg:gap-6">
            <div className="w-20 h-12 sm:w-32 sm:h-20 md:w-40 md:h-24 lg:w-[192px] lg:h-[108px] bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={heroLogo}
                alt={heroChannelName || ""}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-1 sm:gap-2 min-w-0 flex-1 pr-12 sm:pr-16 lg:pr-24">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="bg-[#E41932] text-white text-[10px] sm:text-[11px] font-bold tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded">
                  LIVE
                </span>
                {activeProgram && (
                  <span className="text-white/80 text-xs sm:text-sm font-medium">
                    {format(parseISO(activeProgram.start), "HH:mm")} -{" "}
                    {format(parseISO(activeProgram.end), "HH:mm")}
                  </span>
                )}
                {typeof streamDetails?.totalViews === "number" && (
                  <span className="flex items-center gap-1 sm:gap-1.5 text-white/80 text-xs sm:text-sm font-medium">
                    <Eye size={12} className="sm:w-[14px] sm:h-[14px]" />
                    {streamDetails.totalViews.toLocaleString()}{" "}
                    {streamDetails.totalViews === 1 ? "view" : "views"}
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">
                {activeProgram?.title || heroChannelName}
              </h2>

              {activeProgram?.description && (
                <p className="hidden sm:block text-white/60 text-xs sm:text-sm max-w-2xl line-clamp-2">
                  {activeProgram.description}
                </p>
              )}

              {/* <button className="text-[#FFB133] text-xs sm:text-sm font-medium hover:underline mt-0.5 sm:mt-1 self-start">
                More Info
              </button> */}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="px-3 sm:px-6 lg:px-14 py-3 text-xs sm:text-sm text-red-400">
          {error}
        </div>
      )}

      {/* GUIDE HEADER */}
      <section className="px-3 sm:px-6 lg:px-14 pt-5 sm:pt-7 lg:pt-8 pb-3 sm:pb-4 flex flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
          <h3 className="text-base sm:text-lg font-bold">Live Now</h3>
          <span className="text-white/50 text-xs sm:text-sm ml-1 sm:ml-2">
            {channelRows.length} channels
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 sm:gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors"
          >
            <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="font-semibold">
              {dateLabel(activeDateStr, now)}
            </span>
            <span
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              ⌄
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-gradient-to-b from-[#0b0d12] to-[#070707] rounded-2xl shadow-2xl border border-white/10 z-30 overflow-hidden">
              <div className="px-4 py-3 flex justify-between items-center border-b border-white/10">
                <span className="font-semibold text-sm">Filter by day</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="py-2 max-h-72 sm:max-h-80 overflow-y-auto">
                {availableDates.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-white/40 text-center">
                    No scheduled days
                  </div>
                ) : (
                  availableDates.map((dateStr) => {
                    const active = activeDateStr === dateStr;
                    const d = parseApiDate(dateStr);
                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          setProgramDate(dateStr);
                          setOpen(false);
                        }}
                        className={`w-full px-4 py-3 flex justify-between items-center text-left transition-colors ${
                          active ? "bg-white/5" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span
                            className={
                              active
                                ? "text-white text-sm"
                                : "text-white/80 text-sm"
                            }
                          >
                            {dateLabel(dateStr, now)}
                          </span>
                          <span className="text-xs text-white/40">
                            {format(d, "EEE, dd MMM")}
                          </span>
                        </div>
                        <span
                          className={`w-3 h-3 rounded-full ${
                            active ? "bg-[#E41932]" : "bg-white/20"
                          }`}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* EPG GRID */}
      <section className="px-3 sm:px-6 lg:px-14 pb-10 sm:pb-16">
        <div className="rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div
            ref={scrollRef}
            className="overflow-x-auto overflow-y-hidden no-scrollbar"
          >
            <div style={{ width: channelCol + totalGridWidth }}>
              {/* Timeline header */}
              <div
                className="flex sticky top-0 z-20 bg-[#0b0d12]/95 backdrop-blur-sm border-b border-white/10"
                style={{ height: headerHeight }}
              >
                <div
                  className="sticky left-0 z-30 bg-[#0b0d12] border-r border-white/10 flex items-center px-3 sm:px-5 text-[10px] sm:text-xs uppercase tracking-wider text-white/50"
                  style={{ width: channelCol, minWidth: channelCol }}
                >
                  Channel
                </div>
                <div className="relative" style={{ width: totalGridWidth }}>
                  {timeline.map((t) => (
                    <div
                      key={t.hour}
                      className="absolute top-0 h-full flex items-center text-[10px] sm:text-xs text-white/50 border-l border-white/5 pl-2 sm:pl-3"
                      style={{
                        left: t.hour * pxPerHour,
                        width: pxPerHour,
                      }}
                    >
                      {t.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel rows */}
              <div className="relative">
                {/* Now indicator spans all rows for the current day. */}
                {isToday && nowLeftPx >= 0 && nowLeftPx <= totalGridWidth && (
                  <div
                    className="absolute top-0 bottom-0 z-10 pointer-events-none"
                    style={{ left: channelCol + nowLeftPx }}
                  >
                    <div className="w-px h-full bg-[#E41932]" />
                    <div className="absolute -top-2 -left-1.5 w-3 h-3 rounded-full bg-[#E41932]" />
                  </div>
                )}

                {guideLoading && channelRows.length === 0 && (
                  <div className="py-12 sm:py-16 text-center text-sm text-white/50 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    Loading guide…
                  </div>
                )}

                {channelRows.map((row) => {
                  const isSelected = selectedStreamId === row.streamId;
                  const programs = (row.programs ?? [])
                    .map((p) =>
                      clipProgramToDay(p, dayStart, dayEnd, pxPerMinute),
                    )
                    .filter((p): p is NonNullable<typeof p> => p !== null);

                  return (
                    <div
                      key={row.streamId}
                      className={`flex border-b border-white/5 last:border-b-0 transition-colors ${
                        isSelected ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                      }`}
                      style={{ height: rowHeight }}
                    >
                      {/* Channel logo column (sticky left) */}
                      <button
                        onClick={() => setSelectedStreamId(row.streamId)}
                        className={`sticky left-0 z-10 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-3 cursor-pointer px-1 sm:px-4 py-1.5 sm:py-0 border-r transition-colors ${
                          isSelected
                            ? "bg-[#0b0d12] border-[#E41932]/40"
                            : "bg-[#0b0d12]/95 border-white/10 hover:bg-[#11141a]"
                        }`}
                        style={{ width: channelCol, minWidth: channelCol }}
                      >
                        <div className="w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-md sm:rounded-lg bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={
                              row.streamIcon ||
                              row.channelThumbnail ||
                              "https://placehold.co/64x64"
                            }
                            alt={row.channelName}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 w-full text-center sm:text-left">
                          <span className="text-[10px] sm:text-sm font-semibold truncate leading-tight">
                            {row.channelName}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] uppercase tracking-wider text-[#E41932] font-bold mt-0.5">
                              Watching
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Program tiles */}
                      <div
                        className="relative"
                        style={{ width: totalGridWidth, height: rowHeight }}
                      >
                        {/* Hour grid lines */}
                        {timeline.map((t) => (
                          <div
                            key={t.hour}
                            className="absolute top-0 bottom-0 border-l border-white/5"
                            style={{ left: t.hour * pxPerHour }}
                          />
                        ))}

                        {programs.map(
                          ({
                            program,
                            leftPx,
                            widthPx,
                            realStart,
                            realEnd,
                          }) => {
                            const isLive = isWithinInterval(now, {
                              start: realStart,
                              end: realEnd,
                            });
                            return (
                              <div
                                key={program._id}
                                onMouseEnter={(e) => {
                                  const rect =
                                    e.currentTarget.getBoundingClientRect();
                                  setHoveredProgram({
                                    program,
                                    anchor: rect,
                                    realStart,
                                    realEnd,
                                    isLive,
                                  });
                                }}
                                onMouseLeave={() => setHoveredProgram(null)}
                                className={`absolute top-1.5 sm:top-2 bottom-1.5 sm:bottom-2 rounded-md sm:rounded-lg p-2 sm:p-3 overflow-hidden transition-all border ${
                                  isLive
                                    ? "bg-[#E41932]/15 border-[#E41932]/60 hover:bg-[#E41932]/25"
                                    : "bg-white/[0.06] border-white/10 hover:bg-white/[0.1]"
                                }`}
                                style={{
                                  left: leftPx,
                                  width: Math.max(widthPx - 4, 60),
                                }}
                              >
                                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-white/60">
                                  {isLive && (
                                    <span className="bg-[#E41932] text-white px-1 sm:px-1.5 py-px rounded text-[8px] sm:text-[9px] font-bold tracking-wider">
                                      ON NOW
                                    </span>
                                  )}
                                  <span>
                                    {format(realStart, "HH:mm")} -{" "}
                                    {format(realEnd, "HH:mm")}
                                  </span>
                                </div>
                                <h4 className="text-xs sm:text-sm font-semibold mt-0.5 sm:mt-1 line-clamp-2">
                                  {program.title}
                                </h4>
                                {program.description && widthPx > 240 && (
                                  <p className="hidden sm:block text-xs text-white/50 mt-1 line-clamp-1">
                                    {program.description}
                                  </p>
                                )}
                              </div>
                            );
                          },
                        )}

                        {programs.length === 0 && (
                          <div className="sticky left-0 inline-flex items-center h-full px-4 sm:px-6 text-xs sm:text-sm text-white/40">
                            No scheduled programs.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!guideLoading && channelRows.length === 0 && (
                  <div className="py-12 sm:py-16 text-center text-sm text-white/50">
                    No live channels available right now.
                  </div>
                )}

                {/* Infinite-scroll sentinel + loading indicator (otherStreams). */}
                {guide?.pagination?.hasNextPage && (
                  <div
                    ref={sentinelRef}
                    className="sticky left-0 flex items-center justify-center py-4 sm:py-6 text-xs sm:text-sm text-white/50"
                    style={{
                      width: "100vw",
                      maxWidth: channelCol + totalGridWidth,
                    }}
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        Loading more channels…
                      </span>
                    ) : (
                      <span className="text-white/30">Scroll for more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {mounted &&
        hoveredProgram &&
        createPortal(<ProgramTooltip data={hoveredProgram} />, document.body)}
    </main>
  );
}
