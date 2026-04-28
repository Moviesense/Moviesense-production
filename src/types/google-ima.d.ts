// Minimal type declarations for Google IMA SDK
// Full types: https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js
declare namespace google.ima {
  class AdDisplayContainer {
    constructor(
      containerElement: HTMLElement,
      videoElement?: HTMLVideoElement,
    );
    initialize(): void;
    destroy(): void;
  }

  class AdsLoader {
    constructor(container: AdDisplayContainer);
    requestAds(request: AdsRequest): void;
    contentComplete(): void;
    destroy(): void;
    addEventListener(
      event: string,
      handler: (event: any) => void,
    ): void;
  }

  class AdsRequest {
    adTagUrl: string;
    linearAdSlotWidth: number;
    linearAdSlotHeight: number;
    nonLinearAdSlotWidth: number;
    nonLinearAdSlotHeight: number;
  }

  class AdsManager {
    init(
      width: number,
      height: number,
      viewMode: ViewMode,
    ): void;
    start(): void;
    resize(
      width: number,
      height: number,
      viewMode: ViewMode,
    ): void;
    pause(): void;
    resume(): void;
    skip(): void;
    stop(): void;
    destroy(): void;
    getCuePoints(): number[];
    getRemainingTime(): number;
    addEventListener(
      event: string,
      handler: (event: any) => void,
    ): void;
  }

  class AdsManagerLoadedEvent {
    getAdsManager(
      contentPlayback: any,
      settings?: AdsRenderingSettings,
    ): AdsManager;
  }

  class AdsRenderingSettings {
    restoreCustomPlaybackStateOnAdBreakComplete: boolean;
    enablePreloading: boolean;
  }

  class AdEvent {
    type: string;
    getAd(): any;
    getAdData(): any;
  }

  class AdErrorEvent {
    getError(): { getMessage(): string; getErrorCode(): number };
  }

  enum ViewMode {
    NORMAL = "normal",
    FULLSCREEN = "fullscreen",
  }

  namespace AdsManagerLoadedEvent {
    const Type: { ADS_MANAGER_LOADED: string };
  }

  namespace AdErrorEvent {
    const Type: { AD_ERROR: string };
  }

  namespace AdEvent {
    const Type: {
      CONTENT_PAUSE_REQUESTED: string;
      CONTENT_RESUME_REQUESTED: string;
      STARTED: string;
      COMPLETE: string;
      SKIPPED: string;
      ALL_ADS_COMPLETED: string;
      LOADED: string;
      AD_BREAK_READY: string;
      CLICK: string;
      IMPRESSION: string;
      FIRST_QUARTILE: string;
      MIDPOINT: string;
      THIRD_QUARTILE: string;
    };
  }
}
