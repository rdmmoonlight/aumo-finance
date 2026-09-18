"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { QuranVerse } from "@/lib/getQuranVerse";
import { cn } from "@/lib/utils";

interface TopbarProps {
  verse: QuranVerse;
}

export default function Topbar({ verse }: TopbarProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const fullText = useMemo(
    () => `"${verse.textEn}" — QS. ${verse.surahName} ${verse.surahNo}:${verse.ayahNo}`,
    [verse]
  );

  useEffect(() => {
    const check = () => {
      if (containerRef.current && measureRef.current) {
        setIsOverflowing(
          measureRef.current.scrollWidth > containerRef.current.clientWidth + 12
        );
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [fullText]);

  return (
    <header className="sticky top-0 z-10 flex h- shrink-0 items-center justify-between gap-4 border-b border-white/[0.07] bg-[#0E0E0E]/80 px-5 backdrop-blur-xl">
      <style>{`
        @keyframes quran-marquee {
          0% { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
       .animate-quran-marquee {
          animation: quran-marquee 32s linear infinite;
          will-change: transform;
        }
       .group:hover.animate-quran-marquee {
          animation-play-state: paused;
        }
      `}</style>

      {/* BREADCRUMB */}
      <Breadcrumb className="shrink-0">
        <BreadcrumbList className="gap-1.5">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/[0.06] px-2.5 py-1 text- font-[450] text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <IconHome size={12} />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {pathSegments.map((seg, i) => {
            const url = `/${pathSegments.slice(0, i + 1).join("/")}`;
            const isLast = i === pathSegments.length - 1;
            return (
              <div key={url} className="contents">
                <BreadcrumbSeparator className="text-white/15">
                  <IconChevronRight size={14} stroke={1.5} />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isLast? (
                    <BreadcrumbPage className="rounded-full bg-white px-2.5 py-1 text- font-[550] capitalize tracking-[-0.01em] text-zinc-900">
                      {seg.replace(/-/g, " ")}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={url}
                        className="px-2 py-1 text- font-[450] capitalize text-zinc-500 transition-colors hover:text-zinc-200"
                      >
                        {seg.replace(/-/g, " ")}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* QURAN VERSE */}
      <div
        ref={containerRef}
        className="ml-auto hidden max-w- flex-1 justify-end overflow-hidden md:flex [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        {/* measurer */}
        <span
          ref={measureRef}
          className="pointer-events-none invisible absolute whitespace-nowrap text-"
        >
          {fullText}
        </span>

        <div className="group relative flex w-full justify-end">
          {isOverflowing? (
            <div className="flex w-max items-center gap-16 animate-quran-marquee whitespace-nowrap">
              <span className="shrink-0 text- font-[450] tracking-[-0.01em] text-zinc-300 italic">
                {fullText}
              </span>
              <span
                aria-hidden
                className="shrink-0 text- font-[450] tracking-[-0.01em] text-zinc-300 italic"
              >
                {fullText}
              </span>
            </div>
          ) : (
            <p className="truncate text-right text- font-[450] tracking-[-0.01em] text-zinc-400 italic">
              {fullText}
            </p>
          )}

          {/* Tooltip - premium glass card */}
          <div className="pointer-events-none absolute right-0 top-full z-50 mt-3 hidden w- translate-y-1 rounded- border border-white/[0.08] bg-[#151519] p- opacity-0 shadow-[0_16px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)_inset] transition-all duration-200 group-hover:pointer-events-auto group-hover:block group-hover:translate-y-0 group-hover:opacity-100">
            <div className="rounded- bg-gradient-to-b from-[#1C1C20] to-[#151519] p-4">
              <p className="text-right font-serif text- font-medium leading-[1.9] tracking-wide text-white">
                {verse.textAr}
              </p>
              <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              <p className="text-left text-[12.5px] leading-relaxed text-zinc-300 italic">
                "{verse.textEn}"
              </p>
              <p className="mt-3 text-left text- font-medium uppercase tracking-[0.14em] text-zinc-500">
                — QS. {verse.surahName} {verse.surahNo}:{verse.ayahNo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
