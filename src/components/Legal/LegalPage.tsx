import { Header } from "@/components/HomePage/Header";
import Footer from "@/components/Footer";

export interface TocItem {
  id: string;
  label: string;
}

export function LegalLayout({
  title,
  subtitle,
  effective,
  toc,
  children,
}: {
  title: string;
  subtitle: string;
  effective: string;
  toc: TocItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      <Header />

      <main className="flex-1">
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
            {title}
          </h1>
          <p className="relative text-[0.95rem] text-[#d4d4dc]">{subtitle}</p>
        </section>

        {/* CONTENT */}
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-8 px-8 pb-20 pt-14 lg:grid-cols-[240px_1fr] lg:gap-12">
          {/* STICKY TOC */}
          <aside
            className="sticky top-24 hidden lg:block"
            aria-label="Table of contents"
          >
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-6">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-primary">
                Contents
              </h3>
              <ol className="flex flex-col gap-1.5">
                {toc.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-baseline gap-2 text-[0.82rem] leading-[1.4] text-[#c9c9d2] transition-colors hover:text-white"
                    >
                      <span className="flex-shrink-0 text-[0.75rem] font-semibold text-primary">
                        {i + 1}.
                      </span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          {/* BODY */}
          <div className="min-w-0">
            <div className="mb-10 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-[0.78rem] text-[#c9c9d2]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {effective}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export function Section({
  number,
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="mb-12 border-b border-white/[0.08] pb-12 last:mb-0 last:border-none last:pb-0"
    >
      <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.1em] text-primary">
        {number}
      </span>
      <h2 className="mb-4 scroll-mt-28 text-[1.35rem] font-bold text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3.5 text-[0.95rem] leading-[1.8] text-[#d4d4dc] last:mb-0">
      {children}
    </p>
  );
}

export function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 mt-5 text-[0.9rem] font-bold text-white">
      {children}
    </h3>
  );
}

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mb-4 flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="relative pl-5 text-[0.92rem] leading-[1.6] text-[#d4d4dc] before:absolute before:left-0 before:top-[10px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary before:opacity-70 before:content-['']"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-primary/20 border-l-[3px] border-l-primary bg-primary/[0.07] px-5 py-4 text-[0.9rem] leading-[1.6] text-[#d4d4dc]">
      {children}
    </div>
  );
}

export function A({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-primary hover:underline"
    >
      {children}
    </a>
  );
}

export function ContactCard() {
  return (
    <div className="mt-4 flex flex-col gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-7">
      <div>
        <p className="mb-0.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-primary">
          Company
        </p>
        <p className="text-[0.92rem] leading-[1.5] text-[#d4d4dc]">
          Vision Pictures PTY LTD
        </p>
      </div>
      <div className="h-px bg-white/[0.08]" />
      <div>
        <p className="mb-0.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-primary">
          Address
        </p>
        <p className="text-[0.92rem] leading-[1.5] text-[#d4d4dc]">
          Unit 348, 99 Griffith Street
          <br />
          Coolangatta QLD 4225
          <br />
          Australia
        </p>
      </div>
      <div className="h-px bg-white/[0.08]" />
      <div>
        <p className="mb-0.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-primary">
          Support Email
        </p>
        <p className="text-[0.92rem] leading-[1.5]">
          <A href="mailto:developer@visionpictures.com.au">
            developer@visionpictures.com.au
          </A>
        </p>
      </div>
      <div className="h-px bg-white/[0.08]" />
      <div>
        <p className="mb-0.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-primary">
          Website
        </p>
        <p className="text-[0.92rem] leading-[1.5]">
          <A href="http://moviesense.com">moviesense.com</A>
        </p>
      </div>
    </div>
  );
}
