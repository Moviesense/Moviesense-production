"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 200); // Wait for fade out animation
    }, 1500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Background Image with Overlay */}
      {/* <div className="absolute inset-0 z-0">
        <Image
          src="/images/loading-bg.svg"
          alt="Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
      </div> */}

      {/* Logo Circle */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <Image
          src="/images/logo-sense.png"
          alt="Background"
          width={400}
          height={400}
          className="object-cover h-auto w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem]"
          priority
        />
      </div>
    </div>
  );
}
