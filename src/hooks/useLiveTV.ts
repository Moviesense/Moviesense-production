import { useState, useEffect, useCallback, useRef } from "react";
import { liveTVService } from "../services/liveTVService";
import {
  LiveStream,
  LiveStreamListResponse,
  ProgramGuideResponse,
  StreamDetailsResponse,
  StreamDetailsSocketPayload,
} from "../types/liveTV";
import { ensureSocketConnected, socket } from "../lib/socket";

const LIVE_LIST_EVENT = "stream.live_list_updated";
const STREAM_DETAILS_EVENT = "stream.details_updated";
const STREAM_SUBSCRIBE_EVENT = "stream:subscribe";
const STREAM_UNSUBSCRIBE_EVENT = "stream:unsubscribe";

const GUIDE_PAGE_LIMIT = 10;
const GUIDE_REFETCH_DEBOUNCE_MS = 500;

export const useLiveTV = () => {
  const [liveList, setLiveList] = useState<LiveStream[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [streamDetails, setStreamDetails] =
    useState<StreamDetailsResponse | null>(null);
  const [streamUnavailable, setStreamUnavailable] = useState(false);
  const [programDate, setProgramDate] = useState<string | null>(null);
  const [guide, setGuide] = useState<ProgramGuideResponse | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedStreamIdRef = useRef<string | null>(null);
  selectedStreamIdRef.current = selectedStreamId;
  const programDateRef = useRef<string | null>(null);
  programDateRef.current = programDate;

  const fetchLiveList = useCallback(async () => {
    try {
      const data: LiveStreamListResponse = await liveTVService.getLiveList();
      if (data.status) {
        setLiveList(data.list);
        setError(null);
        setSelectedStreamId((prev) => {
          if (prev && data.list.some((s) => s._id === prev)) return prev;
          return data.list[0]?._id ?? null;
        });
      }
    } catch {
      setError("Failed to fetch live list");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStreamDetails = useCallback(
    async (id: string, date?: string | null) => {
      try {
        const data = await liveTVService.getStreamDetails(
          id,
          date ?? undefined,
        );
        if (data.status) {
          if (!data.stream) {
            setStreamUnavailable(true);
            setStreamDetails(null);
          } else {
            setStreamUnavailable(false);
            setStreamDetails(data);
            setError(null);
          }
        }
      } catch {
        setError("Failed to fetch stream details");
      }
    },
    [],
  );

  const fetchGuide = useCallback(
    async (
      currentStream: string,
      date: string | null | undefined,
      page = 1,
      append = false,
    ) => {
      if (append) setLoadingMore(true);
      else setGuideLoading(true);

      try {
        const data = await liveTVService.getProgramGuide({
          currentStream,
          programDate: date ?? undefined,
          page,
          limit: GUIDE_PAGE_LIMIT,
        });
        if (data.status) {
          setGuide((prev) => {
            if (append && prev) {
              // Keep the existing currentStream + dates; append other-streams.
              return {
                ...data,
                programs: {
                  currentStream: prev.programs.currentStream,
                  otherStreams: [
                    ...prev.programs.otherStreams,
                    ...data.programs.otherStreams,
                  ],
                },
              };
            }
            return data;
          });
        }
      } catch {
        setError("Failed to fetch program guide");
      } finally {
        if (append) setLoadingMore(false);
        else setGuideLoading(false);
      }
    },
    [],
  );

  const loadMoreOtherStreams = useCallback(() => {
    if (!guide || !guide.pagination.hasNextPage) return;
    if (loadingMore || guideLoading) return;
    const sid = selectedStreamIdRef.current;
    if (!sid) return;
    fetchGuide(sid, programDateRef.current, guide.pagination.page + 1, true);
  }, [guide, loadingMore, guideLoading, fetchGuide]);

  useEffect(() => {
    fetchLiveList();
  }, [fetchLiveList]);

  // REST: stream details (just metadata + totalViews now).
  useEffect(() => {
    if (!selectedStreamId) {
      setStreamDetails(null);
      setStreamUnavailable(false);
      return;
    }
    setStreamUnavailable(false);
    fetchStreamDetails(selectedStreamId, programDate);
  }, [selectedStreamId, programDate, fetchStreamDetails]);

  // REST: program guide (rebuilt whenever channel or date changes).
  useEffect(() => {
    if (!selectedStreamId) {
      setGuide(null);
      return;
    }
    fetchGuide(selectedStreamId, programDate, 1, false);
  }, [selectedStreamId, programDate, fetchGuide]);

  // View tracking: once per stream join.
  useEffect(() => {
    if (!selectedStreamId) return;
    liveTVService
      .trackStreamView(selectedStreamId)
      .then((res) => {
        if (typeof res.totalViews === "number") {
          setStreamDetails((prev) =>
            prev && prev.stream?._id === selectedStreamId
              ? { ...prev, totalViews: res.totalViews }
              : prev,
          );
          setGuide((prev) =>
            prev && prev.programs.currentStream.streamId === selectedStreamId
              ? prev
              : prev,
          );
        }
      })
      .catch(() => {
        // Likely 401 if user is not logged in — safe to ignore.
      });
  }, [selectedStreamId]);

  // Live list socket subscription.
  useEffect(() => {
    ensureSocketConnected();

    const handleListUpdate = (data: LiveStreamListResponse) => {
      if (data?.list) setLiveList(data.list);
    };
    socket.on(LIVE_LIST_EVENT, handleListUpdate);

    const handleConnect = () => {
      fetchLiveList();
    };
    socket.on("connect", handleConnect);

    return () => {
      socket.off(LIVE_LIST_EVENT, handleListUpdate);
      socket.off("connect", handleConnect);
    };
  }, [fetchLiveList]);

  // Per-stream subscription: payload = { streamId, programDate? }.
  useEffect(() => {
    if (!selectedStreamId) return;
    ensureSocketConnected();

    const subPayload = {
      streamId: selectedStreamId,
      programDate: programDate ?? undefined,
    };
    socket.emit(STREAM_SUBSCRIBE_EVENT, subPayload);

    const handleDetailsUpdate = (payload: StreamDetailsSocketPayload) => {
      const currentId = selectedStreamIdRef.current;
      if (!currentId) return;
      const payloadId = payload?.stream?._id;
      if (payloadId && payloadId !== currentId) return;

      if (payload?.stream === null) {
        setStreamUnavailable(true);
        setStreamDetails(null);
        return;
      }

      setStreamUnavailable(false);
      setStreamDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          stream: payload.stream ?? prev.stream,
          totalViews: payload.totalViews ?? prev.totalViews,
          selectedDate: payload.selectedDate ?? prev.selectedDate,
        };
      });
    };

    const handleReconnect = () => {
      socket.emit(STREAM_SUBSCRIBE_EVENT, {
        streamId: selectedStreamId,
        programDate: programDateRef.current ?? undefined,
      });
      fetchStreamDetails(selectedStreamId, programDateRef.current);
    };

    socket.on(STREAM_DETAILS_EVENT, handleDetailsUpdate);
    socket.on("connect", handleReconnect);

    return () => {
      socket.emit(STREAM_UNSUBSCRIBE_EVENT, subPayload);
      socket.off(STREAM_DETAILS_EVENT, handleDetailsUpdate);
      socket.off("connect", handleReconnect);
    };
  }, [selectedStreamId, programDate, fetchStreamDetails]);

  // Program-guide subscription, keyed off the date room from the response.
  useEffect(() => {
    const info = guide?.socket;
    if (!info) return;

    ensureSocketConnected();
    socket.emit(info.subscribeEvent, info.subscribePayload);

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const handleGuideUpdate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const sid = selectedStreamIdRef.current;
        if (sid) fetchGuide(sid, programDateRef.current, 1, false);
      }, GUIDE_REFETCH_DEBOUNCE_MS);
    };
    socket.on(info.event, handleGuideUpdate);

    const handleReconnect = () => {
      socket.emit(info.subscribeEvent, info.subscribePayload);
      const sid = selectedStreamIdRef.current;
      if (sid) fetchGuide(sid, programDateRef.current, 1, false);
    };
    socket.on("connect", handleReconnect);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      socket.emit(info.unsubscribeEvent, info.subscribePayload);
      socket.off(info.event, handleGuideUpdate);
      socket.off("connect", handleReconnect);
    };
    // Keyed on `room` so we only resubscribe on date change, not on every refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide?.socket?.room, fetchGuide]);

  return {
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
    refreshLiveList: fetchLiveList,
  };
};
