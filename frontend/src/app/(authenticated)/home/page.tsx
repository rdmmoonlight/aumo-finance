"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Notebook,
  LineChart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MarketItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isUp: boolean;
}

export default function HomePage() {
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUsdRate(): Promise<MarketItem | null> {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const rate = data?.rates?.IDR;
          if (rate) {
            return {
              symbol: "USD/IDR",
              name: "Rupiah",
              price: `Rp ${Math.round(rate).toLocaleString("id-ID")}`,
              change: "Live",
              isUp: true,
            };
          }
        }
      } catch {}
      return null;
    }

    async function fetchIhsg(): Promise<MarketItem | null> {
      const yahooEndpoints = [
        "https://query1.finance.yahoo.com/v8/finance/chart/%5EJKSE",
        "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5EJKSE",
      ];

      const proxies = [
        (url: string) =>
          `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}&t=${Date.now()}`,
        (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        (url: string) =>
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      ];

      for (const yahooUrl of yahooEndpoints) {
        for (const proxyFn of proxies) {
          try {
            const res = await fetch(proxyFn(yahooUrl), { cache: "no-store" });
            if (!res.ok) continue;
            const data = await res.json();

            // v8 chart
            const meta = data?.chart?.result?.[0]?.meta;
            if (meta?.regularMarketPrice) {
              const price = meta.regularMarketPrice;
              const prevClose = meta.chartPreviousClose || meta.previousClose;
              const changePercent = prevClose
               ? ((price - prevClose) / prevClose) * 100
                : 0;
              const isUp = changePercent >= 0;
              return {
                symbol: "IHSG",
                name: "Indeks Saham",
                price: price.toLocaleString("id-ID", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }),
                change: `${isUp? "+" : ""}${changePercent.toFixed(2)}%`,
                isUp,
              };
            }

            // v7 quote
            const quote = data?.quoteResponse?.result?.[0];
            if (quote?.regularMarketPrice) {
              const isUp = (quote.regularMarketChangePercent?? 0) >= 0;
              return {
                symbol: "IHSG",
                name: "Indeks Saham",
                price: quote.regularMarketPrice.toLocaleString("id-ID", {
                  minimumFractionDigits: 2,
                }),
                change: quote.regularMarketChangePercent
                 ? `${isUp? "+" : ""}${quote.regularMarketChangePercent.toFixed(2)}%`
                  : "0.00%",
                isUp,
              };
            }
          } catch {}
        }
      }
      return null;
    }

    async function fetchAll() {
      const results = await Promise.allSettled([fetchUsdRate(), fetchIhsg()]);
      const items: MarketItem[] = [];
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value) items.push(r.value);
      });
      setMarketData(items);
      setIsLoading(false);
    }

    fetchAll();
  }, []);

  return (
    <div className="grid w-full place-items-center py-6">
      <Card className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-white shadow-2xl">
        <CardContent className="p-6 md:p-8">
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h6 className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <LineChart size={16} /> Market Indicators
              </h6>
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400"
              >
                LIVE
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {isLoading? (
                <div className="col-span-2 py-4 text-center text-xs text-white/40">
                  Memuat indikator pasar...
                </div>
              ) : marketData.length > 0? (
                marketData.map((item) => (
                  <div
                    key={item.symbol}
                    className="flex min-h- flex-col justify-between rounded-lg border border-white/10 bg-black/40 p-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {item.symbol}
                      </span>
                      <Badge
                        className={`flex items-center border-0 px-1.5 py-0.5 text- ${
                          item.isUp
                           ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {item.isUp? (
                          <TrendingUp size={10} className="mr-0.5" />
                        ) : (
                          <TrendingDown size={10} className="mr-0.5" />
                        )}
                        {item.change}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {item.price}
                    </div>
                    <div className="text- text-white/50">{item.name}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-4 text-center text-xs text-white/40">
                  Gagal memuat indikator pasar.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="mx-auto max-w-md text-sm leading-relaxed text-white/80">
              Integrated financial & accounting intelligence core. Manage
              full-cycle general ledgers, trial balances, and operational
              analytics with absolute precision.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                className="flex items-center gap-2 rounded-xl border border-indigo-300/20 bg-gradient-to-br from-indigo-500/80 to-violet-600/80 text-white shadow-lg hover:from-indigo-500 hover:to-violet-600"
              >
                <Link href="/dashboard">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/journal-entry">
                  <Notebook size={16} /> Journal Entry
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
