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
    () =>
      `"${verse.textEn}" — QS. ${verse.surahName} ${verse.surahNo}:${verse.ayahNo}`,
    [verse],
  );

  useEffect(() => {
    const check = () => {
      if (containerRef.current && measureRef.current) {
        setIsOverflowing(
          measureRef.current.scrollWidth >
            containerRef.current.clientWidth + 12,
        );
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [fullText]);

  return (
    <header className="aumo-topbar-header">
      {/* BREADCRUMB WITH HORIZONTAL SCROLL AREA */}
      <ScrollArea className="aumo-topbar-breadcrumb-scroll">
        <Breadcrumb>
          <BreadcrumbList className="aumo-topbar-breadcrumb-list">
            <BreadcrumbItem className="aumo-topbar-breadcrumb-item">
              <BreadcrumbLink asChild>
                <Link href="/" className="aumo-topbar-home-link">
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
                  <BreadcrumbItem className="aumo-topbar-breadcrumb-item">
                    {isLast ? (
                      <BreadcrumbPage className="aumo-topbar-page-active">
                        {seg.replace(/-/g, " ")}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={url} className="aumo-topbar-page-link">
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
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>

      {/* QURAN VERSE */}
      <div
        ref={containerRef}
        className="aumo-topbar-quran-container [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        {/* measurer */}
        <span
          ref={measureRef}
          className="pointer-events-none absolute invisible whitespace-nowrap text-xs"
        >
          {fullText}
        </span>

        <div className="group relative flex w-full justify-end">
          {isOverflowing ? (
            <div className="aumo-topbar-quran-marquee-wrapper">
              <span className="aumo-topbar-quran-text">{fullText}</span>
              <span aria-hidden className="aumo-topbar-quran-text">
                {fullText}
              </span>
            </div>
          ) : (
            <p className="aumo-topbar-quran-static">{fullText}</p>
          )}

          {/* Tooltip - premium glass card */}
          <div className="aumo-topbar-tooltip-outer">
            <div className="aumo-topbar-tooltip-inner">
              <p className="aumo-topbar-tooltip-ar">{verse.textAr}</p>
              <div className="aumo-topbar-tooltip-divider" />
              <p className="aumo-topbar-tooltip-en">"{verse.textEn}"</p>
              <p className="aumo-topbar-tooltip-surah">
                — QS. {verse.surahName} {verse.surahNo}:{verse.ayahNo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
