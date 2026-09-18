"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { IconChevronRight } from "@tabler/icons-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
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

  useEffect(() => {
    const check = () => {
      if (containerRef.current && measureRef.current) {
        setIsOverflowing(
          measureRef.current.scrollWidth > containerRef.current.clientWidth + 10
        );
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fullText = `"${verse.textEn}" — QS. ${verse.surahName} ${verse.surahNo}:${verse.ayahNo}`;

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[var(--color-matte)] px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 gap-4">
      <style>{`@keyframes quran-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.animate-quran-marquee{animation:quran-marquee 24s linear infinite}`}</style>
      
      <Breadcrumb className="shrink-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="text-zinc-500 hover:text-white text-xs">
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathSegments.map((seg, i) => {
            const url = `/${pathSegments.slice(0, i + 1).join("/")}`;
            const isLast = i === pathSegments.length - 1;
            return (
              <div key={url} className="contents">
                <BreadcrumbSeparator className="text-white/20">
                  <IconChevronRight size={14} />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="capitalize text-white text-xs">
                      {seg.replace(/-/g, " ")}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={url}
                        className="capitalize text-zinc-500 hover:text-white text-xs"
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

      <div
        ref={containerRef}
        className="ml-auto hidden md:flex flex-1 justify-end max-w-xl overflow-hidden"
      >
        <span
          ref={measureRef}
          className="invisible absolute whitespace-nowrap"
          style={{ fontSize: "10.5px" }}
        >
          {fullText}
        </span>
        <div className="group relative w-full flex justify-end">
          {isOverflowing ? (
            <div className="flex gap-12 animate-quran-marquee whitespace-nowrap">
              <span
                style={{ color: "#FFFFFF", fontSize: "10.5px" }}
                className="font-medium italic shrink-0"
              >
                {fullText}
              </span>
              <span
                aria-hidden
                style={{ color: "#FFFFFF", fontSize: "10.5px" }}
                className="font-medium italic shrink-0"
              >
                {fullText}
              </span>
            </div>
          ) : (
            <p
              className="truncate text-right font-medium italic"
              style={{ color: "#FFFFFF", fontSize: "10.5px" }}
            >
              {fullText}
            </p>
          )}
          <div className="absolute right-0 top-full mt-3 hidden group-hover:block z-50 w-72 rounded-xl bg-[#242427] border border-white/[0.08] p-3.5">
            <p
              className="text-right leading-relaxed"
              style={{ color: "#FFFFFF", fontSize: "14px" }}
            >
              {verse.textAr}
            </p>
            <p
              className="mt-2 text-left italic"
              style={{ color: "#FFFFFF", fontSize: "11px" }}
            >
              "{verse.textEn}"
            </p>
            <p
              className="mt-2 text-left"
              style={{ color: "#FFFFFF", fontSize: "9px", opacity: 0.5 }}
            >
              — QS. {verse.surahName} {verse.surahNo}:{verse.ayahNo}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}