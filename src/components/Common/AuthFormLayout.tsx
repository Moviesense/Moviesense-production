import Image from "next/image";
import React from "react";
import { BackButton } from "./BackButton";

interface AuthFormLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthFormLayout: React.FC<AuthFormLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <section className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Logo */}
      <BackButton className="absolute top-6 left-6 sm:top-10 sm:left-10" />
      <div className="relative mb-8 sm:mb-10">
        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-pink-400 bg-black/30 shadow-lg" />
        <Image
          width={99}
          height={72}
          src="/images/logo.png"
          alt="Logo"
          className="absolute inset-0 m-auto w-16 h-14 sm:w-24 sm:h-20"
        />
      </div>

      <h1 className="text-3xl sm:text-5xl font-medium mb-3 sm:mb-4 text-center">
        {title}
      </h1>

      <p className="text-neutral-300 text-base sm:text-xl mb-8 sm:mb-10 max-w-xl text-center px-2 sm:px-4">
        {subtitle}
      </p>

      {children}
    </section>
  );
};
