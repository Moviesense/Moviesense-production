import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/HomePage/Header";
import Footer from "@/components/Footer";

const orangeGradient = "linear-gradient(135deg,#ff8a1e,#ff4e09)";

const B = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-semibold text-white">{children}</strong>
);

interface Device {
  title: string;
  icon: React.ReactNode;
  iconStyle?: React.CSSProperties;
  image: string;
  steps: React.ReactNode[];
  note?: string;
}

const devices: Device[] = [
  {
    title: "Apple TV",
    icon: "▶",
    iconStyle: { background: "linear-gradient(135deg,#333,#555)" },
    image: "/images/htw-appletv.jpg",
    steps: [
      "Make sure your iPhone or iPad and Apple TV are on the same Wi-Fi network.",
      "Open MovieSense on your iPhone or iPad in Safari or your preferred browser and sign in.",
      <>
        Open <B>Control Center</B> on your iPhone or iPad and tap{" "}
        <B>Screen Mirroring</B>.
      </>,
      "Select your Apple TV, enter the AirPlay code if prompted, and start watching.",
    ],
  },
  {
    title: "Amazon Fire Stick",
    icon: "🔥",
    image: "/images/htw-firestick.jpg",
    steps: [
      "Go to the Fire TV home screen.",
      <>
        Open the <B>Silk Browser</B>.
      </>,
      <>
        Go to <B>moviesense.com</B> and sign in.
      </>,
      "Select your film or lesson and enjoy.",
    ],
  },
  {
    title: "Samsung Smart TV",
    icon: "📺",
    image: "/images/htw-samsung.jpg",
    steps: [
      <>
        Press the <B>Home</B> or <B>Smart TV</B> button on your Samsung remote.
      </>,
      <>
        Open the built-in <B>Web Browser</B> / <B>Internet</B> app.
      </>,
      <>
        Go to <B>moviesense.com</B> and sign in.
      </>,
      "Select your film or lesson and enjoy.",
    ],
  },
  {
    title: "LG Smart TV",
    icon: "📡",
    image: "/images/htw-lg.jpg",
    steps: [
      <>
        Press the <B>Home</B> button on your LG remote.
      </>,
      <>
        Open the <B>Web Browser</B> app from the home screen.
      </>,
      <>
        Go to <B>moviesense.com</B> and sign in.
      </>,
      "Select your film or lesson and enjoy.",
    ],
  },
  {
    title: "Chromecast",
    icon: "📲",
    image: "/images/htw-chromecast.jpg",
    steps: [
      "Make sure your Chromecast and your computer are on the same Wi-Fi network.",
      <>
        Open <B>Chrome</B> on your computer and go to <B>moviesense.com</B>.
      </>,
      "Sign in and start the video you want to watch.",
      <>
        Open the Chrome menu and choose <B>Cast</B>, then select your Chromecast
        device.
      </>,
    ],
    note: "Tip: Chromecast casting options can vary by phone, so desktop Chrome is the simplest support path.",
  },
  {
    title: "Mobile & Tablet",
    icon: "📱",
    image: "/images/htw-mobile.jpg",
    steps: [
      "Open Safari, Chrome, or your preferred browser.",
      <>
        Go to <B>moviesense.com</B> and sign in.
      </>,
      "Select your film or lesson and enjoy.",
    ],
  },
];

const infoCards = [
  {
    title: "Best Experience",
    body: "For the smoothest playback, use a modern browser like Safari, Chrome, or Firefox on a stable internet connection.",
  },
  {
    title: "Download for Offline",
    body: "If downloadable lessons are available in your course area, save them in advance before travelling or watching on the go.",
  },
  {
    title: "Multiple Devices",
    body: "Your progress can continue across devices, so you can start on your TV and pick up later on your phone or tablet.",
  },
];

export default function HowToWatchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      <Header />

      <main className="flex-1 pt-8 sm:pt-0">
        {/* HERO */}
        <section
          className="relative overflow-hidden px-8 pb-14 pt-28 text-center sm:pt-32"
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
          <h1 className="relative mb-4 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight">
            How to Watch
          </h1>
          <p className="relative mx-auto max-w-[560px] text-[1.1rem] text-[#d4d4dc]">
            Stream your favourite films and lessons on any device — here&apos;s
            how to get started.
          </p>
        </section>

        {/* CONTENT */}
        <div className="mx-auto max-w-[1280px] px-8 py-14">
          <h2 className="mb-10 text-center text-[clamp(1.4rem,3vw,2rem)] font-bold">
            How to watch your favourite films
          </h2>

          {/* DEVICE GRID */}
          <div className="mb-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <article
                key={device.title}
                className="group overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] transition-all duration-200 hover:-translate-y-1 hover:border-primary/35"
              >
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] text-xl text-white"
                      style={device.iconStyle ?? { background: orangeGradient }}
                    >
                      {device.icon}
                    </div>
                    <h3 className="text-[1.1rem] font-bold">{device.title}</h3>
                  </div>

                  <div className="mb-5 aspect-video overflow-hidden rounded-lg bg-white/[0.04]">
                    <Image
                      src={device.image}
                      alt={device.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <ol className="flex flex-col gap-3">
                    {device.steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[0.9rem] leading-[1.5] text-[#d4d4dc]"
                      >
                        <span
                          className="mt-px flex h-6 w-6 min-w-6 flex-shrink-0 items-center justify-center rounded-full text-[0.75rem] font-bold text-white"
                          style={{ background: orangeGradient }}
                        >
                          {i + 1}
                        </span>
                        <div>{step}</div>
                      </li>
                    ))}
                  </ol>

                  {device.note && (
                    <p className="mt-3 rounded-md border-l-[3px] border-primary bg-white/[0.04] px-3 py-2.5 text-[0.8rem] text-white/40">
                      {device.note}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* HELP BOX */}
          <section
            className="mb-14 rounded-xl border border-primary/25 px-10 py-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,138,46,0.1), rgba(255,78,9,0.08))",
            }}
          >
            <h2 className="mb-3 text-[1.6rem] font-bold">Need Help?</h2>
            <p className="mx-auto mb-6 max-w-[520px] text-[#d4d4dc]">
              Having trouble accessing your course? Our support team is here to
              help you get started with watching your acting lessons on any
              device.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full px-9 py-3.5 font-bold text-white transition-[filter] duration-200 hover:brightness-110"
              style={{
                background: "linear-gradient(180deg,#ff8a1e 0%,#ff4e09 100%)",
                boxShadow: "0 10px 26px rgba(255,92,10,0.35)",
              }}
            >
              Contact Support
            </Link>
          </section>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {infoCards.map((card) => (
              <article
                key={card.title}
                className="flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.04] p-7"
              >
                <h3 className="mb-2.5 text-base font-bold text-primary">
                  {card.title}
                </h3>
                <p className="flex-1 text-[0.9rem] leading-[1.6] text-[#d4d4dc]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
