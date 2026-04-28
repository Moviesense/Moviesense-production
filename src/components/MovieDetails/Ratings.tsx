import React from "react";

export interface Rating {
  title?: string;
  value: number;
}

export function Ratings({ ratings }: { ratings: Rating[] }) {
  return (
    <>
      {/* ⭐ Gradient definition (MUST be once in DOM) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" /> {/* sky-500 */}
            <stop offset="50%" stopColor="#06b6d4" /> {/* cyan-500 */}
            <stop offset="100%" stopColor="#14b8a6" /> {/* teal-500 */}
          </linearGradient>
        </defs>
      </svg>

      <div className="flex gap-4">
        {ratings.map((rating, index) => (
          <RatingCard key={index} title={rating.title} value={rating.value} />
        ))}
      </div>
    </>
  );
}

function RatingCard({ title, value }: { title?: string; value: number }) {
  return (
    <div className="">
      {title && (
        <p className="text-xs xl:text-md 2xl:text-base text-neutral-400 font-medium mb-1 sm:mb-2">
          {title}
        </p>
      )}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <StarRating value={value} />
        <span className="text-sm xl:text-md 2xl:text-base font-medium">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} fill="full" />
      ))}

      {hasHalfStar && <Star fill="half" />}

      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} fill="empty" />
      ))}
    </div>
  );
}

function Star({ fill }: { fill: "full" | "half" | "empty" }) {
  return (
    <div className="relative w-5 h-5">
      {/* Outline */}
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-0 fill-none stroke-neutral-500"
        strokeWidth="2"
      >
        <path d="M12 17.3l-6.18 3.64 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63L22 9.24l-5.46 4.67 1.64 7.03z" />
      </svg>

      {/* Fill */}
      {fill !== "empty" && (
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 fill-[url(#ratingGradient)]"
        >
          <defs>
            <clipPath id={`clip-${fill}`}>
              {fill === "half" ? (
                <rect x="0" y="0" width="12" height="24" />
              ) : (
                <rect x="0" y="0" width="24" height="24" />
              )}
            </clipPath>
          </defs>

          <path
            clipPath={`url(#clip-${fill})`}
            d="M12 17.3l-6.18 3.64 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63L22 9.24l-5.46 4.67 1.64 7.03z"
          />
        </svg>
      )}
    </div>
  );
}
