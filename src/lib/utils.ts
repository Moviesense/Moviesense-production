import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const supportWhatsApp = "971525120129";
export const supportEmail = "support@nabtt.com";
export const supportPageUrl = "https://moviesense.com/support/";

export const formatViews = (views: string | number | undefined) => {
  if (views === undefined || views === null) return "";

  let num: number;
  if (typeof views === "number") {
    num = views;
  } else {
    num = parseInt(views.replace(/,/g, ""), 10);
  }

  if (isNaN(num)) return views.toString();

  if (num >= 1000000) {
    return (
      parseFloat(
        (num / 1000000)
          .toFixed(4)
          .replace(/\.00$/, "")
          .replace(/(\.[0-9])0$/, "$1"),
      ) + "m"
    );
  }
  if (num >= 1000) {
    return (
      parseFloat(
        (num / 1000)
          .toFixed(4)
          .replace(/\.00$/, "")
          .replace(/(\.[0-9])0$/, "$1"),
      ) + "k"
    );
  }
  return num.toString();
};

export function stripHtml(html: string | undefined) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function formatRuntime(seconds: number | undefined) {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const hDisplay = h > 0 ? `${h.toString().padStart(2, "0")}:` : "";
  const mDisplay = m.toString().padStart(2, "0");
  const sDisplay = s.toString().padStart(2, "0");

  return `${hDisplay}${mDisplay}:${sDisplay}`;
}

export function getImageUrl(url: string | undefined): string {
  if (!url) return "/images/image.png";

  if (url.startsWith("s3://")) {
    // Convert s3://bucket-name/key to https://bucket-name/key (matching next.config.mjs)
    // Or if it should be cloudfront, we can use that.
    // Given the user added 'nabtt-dev' to next.config.mjs, we assume they want https://nabtt-dev/
    return url.replace("s3://", "https://");
  }

  return url;
}

export function getYouTubeVideoId(url: string | undefined): string | null {
  if (!url) return null;

  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  return match && match[1].length === 11 ? match[1] : null;
}

export async function getCountry(): Promise<string> {
  if (typeof window === "undefined") return "UAE";

  const savedCountry = localStorage.getItem("userCountry");
  if (savedCountry) return savedCountry;

  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (data.country_code) {
      localStorage.setItem("userCountry", data.country_code);
      return data.country_code;
    }
  } catch (error) {
    console.error("Failed to detect country:", error);
  }
  return "UAE"; // Default fallback
}

export async function handleShare(title: string, id: string | number) {
  const shareUrl = `${window.location.origin}/movie/${id}`;
  const shareText = `${title}\n${shareUrl}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: title,
        url: shareUrl,
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    return "copied";
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}

export const formatYear = (year: any) => {
  if (!year) return null;
  const parsed = new Date(year).getFullYear();
  return Number.isFinite(parsed) ? parsed : year;
};
