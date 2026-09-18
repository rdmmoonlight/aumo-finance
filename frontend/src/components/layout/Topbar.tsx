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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { QuranVerse } from "@/lib/getQuranVerse";

export default function Topbar({ verse }: { verse: QuranVerse }) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const fullText = useMemo(
    () =>
      `"${verse.textEn}" — QS. ${verse.surahName} ${verse.surahNo}:${verse.ayahNo}`,
    [verse],
  );

  useEffect(() => {
    const check = () => {
      if (containerRef.current && measureRef.current) {
        setIsOverflowing(
          measureRef.current.scrollWidth > containerRef.current.clientWidth,
        );
      }
    };
    check();
    const ro = new ResizeObserver(check);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [fullText]);

  return (
    <header className="sticky top-0 z-10 flex h-12 w-full shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] bg-[#0E0E0E]/90 px-4 backdrop-blur-xl lg:px-6">
      {/* BREADCRUMB */}
      <ScrollArea className="min-w-0 flex-1">
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap gap-1 text-">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="flex items-center gap-1 text-zinc-400 hover:text-white"
                >
                  <IconHome size={12} /> Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.map((seg, i) => {
              const href = `/${pathSegments.slice(0, i + 1).join("/")}`;
              const isLast = i === pathSegments.length - 1;
              return (
                <div key={href} className="contents">
                  <BreadcrumbSeparator className="text-white/15">
                    <IconChevronRight size={12} />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="max-w- truncate text- font-medium text-white">
                        {seg.replace(/-/g, " ")}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={href}
                          className="max-w- truncate text-zinc-500 hover:text-zinc-200"
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
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>

      {/* QURAN VERSE - FIX RAKSASA */}
      <div
        ref={containerRef}
        className="relative ml-auto hidden min-w-0 max-w-[44%] items-center justify-end overflow-hidden md:flex lg:max-w-[55%] [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
      >
        {/* pengukur lebar asli, invisible */}
        <span
          ref={measureRef}
          className="pointer-events-none invisible absolute whitespace-nowrap text-"
        >
          {fullText}
        </span>

        <div className="group relative flex w-full justify-end">
          {isOverflowing ? (
            <div className="flex w-full overflow-hidden">
              <div className="flex w-max animate-quran-marquee items-center gap-8 whitespace-nowrap group-hover:[animation-play-state:paused]">
                <span className="text- font-medium leading-none text-zinc-400">
                  {fullText}
                </span>
                <span
                  aria-hidden
                  className="text- font-medium leading-none text-zinc-400"
                >
                  {fullText}
                </span>
              </div>
            </div>
          ) : (
            <p className="truncate text-right text- font-medium leading-none text-zinc-400">
              {fullText}
            </p>
          )}

          {/* Tooltip */}
          <div className="pointer-events-none absolute right-0 top-[calc(100%+10px)] z-50 hidden w- opacity-0 transition-all group-hover:block group-hover:opacity-100">
            <div className="rounded-xl border border-white/10 bg-[#151519] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <p className="text-right text- font-medium leading-relaxed text-white line-clamp-4">
                {verse.textAr}
              </p>
              <div className="my-2 h-px bg-white/10" />
              <p className="text- leading-snug text-zinc-300">
                "{verse.textEn}"
              </p>
              <p className="mt-1.5 text- uppercase tracking-widest text-zinc-500">
                — QS. {verse.surahName} {verse.surahNo}:{verse.ayahNo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
