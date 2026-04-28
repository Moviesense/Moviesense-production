"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDE_FOOTER_ROUTES = [
  "/login",
  "/signup",
  "/who-is-watching",
  "/forgot-password",
  "/verify-email",
  "/user",
  "/search",
  "/shorts",
];

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on splash screen (root path)
  if (pathname === "/") return null;

  // Hide footer on specific routes
  if (HIDE_FOOTER_ROUTES.some((route) => pathname?.startsWith(route))) {
    return null;
  }

  return <Footer />;
}
