import React from "react";

interface CategoryProps {
  title: string;
  name: string;
  country: string;
  avatar: string;
}

export function Category({ title, name, country, avatar }: CategoryProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <p className="text-neutral-400 text-base sm:text-lg font-medium">
        {title}
      </p>

      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-900 border border-neutral-800 rounded-lg">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover"
        />

        <div className="flex flex-col min-w-0">
          <p className="text-white text-base sm:text-lg font-medium truncate">
            {name}
          </p>
          <p className="text-neutral-400 text-xs sm:text-sm">From {country}</p>
        </div>
      </div>
    </div>
  );
}
