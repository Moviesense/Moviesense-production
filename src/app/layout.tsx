import type { Metadata, Viewport } from "next";
import { Almarai, Inter } from "next/font/google";
import "./globals.css";

const almarai = Almarai({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Movie Sense",
  description: "Movie Sense",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-sense.png",
    shortcut: "/logo-sense.png",
    apple: "/logo-sense.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Movie Sense",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1f252e",
};

import QueryProvider from "@/components/QueryProvider";
import { ToastProvider } from "@/context/ToastContext";
import ConditionalFooter from "@/components/ConditionalFooter";
import { LanguageProvider } from "@/context/LanguageContext";

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo-sense.png" />
      </head>
      <body className={`${almarai.variable} ${inter.variable}`}>
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>{children}</ToastProvider>
              <ConditionalFooter />
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
