"use client";

import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";
// import LandingPage from "@/components/LandingPage";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // Check for token on client-side only to prevent hydration mismatch
  useEffect(() => {
    // Always redirect to home after splash in the new flow
    // Auth check will be handled within the home/header components
  }, [router]);

  const handleSplashFinish = () => {
    router.push("/home");
    setShowSplash(false);
  };

  // Set isCheckingAuth to false immediately as we don't block landing anymore
  useEffect(() => {
    setIsCheckingAuth(false);
  }, []);

  // Don't render anything until we've checked auth to prevent flash
  if (isCheckingAuth) {
    return null;
  }

  return (
    <main className="min-h-screen">
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
    </main>
  );
}
