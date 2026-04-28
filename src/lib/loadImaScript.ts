let imaLoadPromise: Promise<void> | null = null;

export function loadImaScript(): Promise<void> {
  if (imaLoadPromise) return imaLoadPromise;

  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cannot load IMA SDK on server"));
  }

  if ((window as any).google?.ima) {
    return Promise.resolve();
  }

  imaLoadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      imaLoadPromise = null;
      reject(new Error("Failed to load Google IMA SDK"));
    };
    document.head.appendChild(script);
  });

  return imaLoadPromise;
}
