"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Youtube, Instagram, Facebook } from "lucide-react";
import { Header } from "@/components/HomePage/Header";
import Footer from "@/components/Footer";

const orangeGradient = "linear-gradient(135deg,#ff8a1e,#ff4e09)";

const contactOptions = [
  {
    icon: "🎫",
    title: "Log a Support Ticket",
    body: (
      <span>
        Fill out our contact form and we&apos;ll get back to you ASAP.
      </span>
    ),
    href: "/contact",
  },
  {
    icon: "✉️",
    title: "Email Support",
    body: (
      <a href="mailto:support@moviesense.com" className="text-primary">
        support@moviesense.com
      </a>
    ),
    href: "mailto:support@moviesense.com",
  },
  {
    icon: "🔑",
    title: "Reset Password",
    body: (
      <Link href="/forgot-password" className="text-primary">
        Click here to reset your password
      </Link>
    ),
    href: "/forgot-password",
  },
  {
    icon: "👤",
    title: "Manage Your Account",
    body: (
      <Link href="/profile" className="text-primary">
        Manage membership, cancel or upgrade
      </Link>
    ),
    href: "/profile",
  },
];

const socials = [
  {
    Icon: Youtube,
    label: "YouTube",
    href: "https://www.youtube.com/@moviesensecom",
  },
  {
    Icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/moviesensecom",
  },
  {
    Icon: Facebook,
    label: "Facebook",
    href: "https://www.facebook.com/MovieSenseCom",
  },
];

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I reset my password?",
    a: (
      <>
        You can{" "}
        <Link href="/forgot-password" className="text-primary">
          click here
        </Link>{" "}
        to reset your password. You&apos;ll receive an email prompting you to
        set a new one.
      </>
    ),
  },
  {
    q: "How do I delete my account?",
    a: (
      <>
        You can manage your membership including cancelling, upgrading, or
        downgrading{" "}
        <Link href="/profile" className="text-primary">
          here
        </Link>
        . To fully delete your account, please log a support ticket and our team
        will assist you.
      </>
    ),
  },
  {
    q: "How do I manage profiles?",
    a: (
      <>
        We currently don&apos;t have profile management available. Stay tuned
        for our app launch where this will be available as a feature.
      </>
    ),
  },
  {
    q: "Why can't I play a video?",
    a: (
      <>
        First check you have an active paid membership — non-members cannot play
        videos. Then check your internet connection. Streaming works best on NBN
        or Wi-Fi and not as well on 5G.
      </>
    ),
  },
  {
    q: "Supported devices",
    a: (
      <>
        You can stream Movie Sense on Apple TV, Fire Stick, Samsung Smart TV, LG
        Smart TV, Chromecast, Mobile, and Tablet. View our full{" "}
        <Link href="/how-to-watch" className="text-primary">
          How to Watch
        </Link>{" "}
        guide for step-by-step instructions.
      </>
    ),
  },
  {
    q: "Streaming troubleshooting",
    a: (
      <>
        If you are having trouble streaming, please log a support ticket and our
        team will investigate. Make sure your browser is up to date and try
        clearing your cache first.
      </>
    ),
  },
  {
    q: "How to delete my account",
    a: (
      <>
        To delete your Movie Sense account, please log a support ticket from
        your{" "}
        <Link href="/profile" className="text-primary">
          account settings
        </Link>{" "}
        and our team will process it for you.
      </>
    ),
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      <Header />

      <main className="flex-1 pt-8 sm:pt-0">
        {/* HERO */}
        <section
          className="relative overflow-hidden px-8 pb-12 pt-28 text-center sm:pt-32"
          style={{
            background:
              "linear-gradient(135deg,#0f1419 0%,#1a2332 50%,#1f252e 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,138,46,0.12) 0%, transparent 70%)",
            }}
          />
          <span className="relative mb-3 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            MovieSense
          </span>
          <h1 className="relative mb-3 text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight">
            Support
          </h1>
          <p className="relative mx-auto max-w-[500px] text-[#d4d4dc]">
            We&apos;re here to help. Find answers below or get in touch with our
            team.
          </p>
        </section>

        {/* TWO-COLUMN */}
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-12 px-8 pb-[72px] pt-14 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <h2 className="mb-5 text-2xl font-bold">Movie Sense Support</h2>
            <div className="space-y-4 text-[0.95rem] leading-[1.75] text-[#d4d4dc]">
              <p>
                We&apos;re thrilled you&apos;re part of the Movie Sense journey
                — a movement that&apos;s redefining what streaming can be!
              </p>
              <p>
                Our growing team is passionate about bringing you carefully
                curated, quality entertainment that brings families together,
                and we&apos;re working around the clock to deliver the
                exceptional viewing experience you deserve.
              </p>
              <p>
                While we continue to perfect our member support systems, our
                dedicated team is currently focused on expanding our film
                library, producing original content, and developing our Academy
                programs.
              </p>
              <p>
                Having trouble streaming our content? Log a ticket and a member
                of our team will get back to you. Alternatively, email us
                directly for support.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {contactOptions.map((opt) => (
                <div
                  key={opt.title}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 transition-colors hover:border-primary/35"
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] text-lg"
                    style={{ background: orangeGradient }}
                  >
                    {opt.icon}
                  </div>
                  <div className="flex flex-col">
                    <strong className="mb-0.5 text-sm font-semibold text-white">
                      {opt.title}
                    </strong>
                    <span className="text-[0.85rem] text-[#d4d4dc]">
                      {opt.body}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4" aria-label="Social links">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#d4d4dc] transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT — FAQ */}
          <div>
            <h2 className="mb-5 text-2xl font-bold">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-2">
              {faqs.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={faq.q}
                    className={`overflow-hidden rounded-xl border bg-white/[0.04] transition-colors ${
                      open ? "border-primary/35" : "border-white/[0.08]"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-[18px] text-left text-[0.95rem] font-semibold transition-colors hover:text-primary ${
                        open ? "text-primary" : "text-white"
                      }`}
                    >
                      {faq.q}
                      <span
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                          open ? "rotate-45" : ""
                        }`}
                        style={
                          open
                            ? { background: orangeGradient }
                            : { background: "rgba(255,138,46,0.15)" }
                        }
                      >
                        <Plus
                          size={12}
                          className={open ? "text-white" : "text-primary"}
                        />
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ${
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-[18px] text-[0.9rem] leading-[1.7] text-[#d4d4dc]">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
