"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconDashboard,
  IconNotebook,
  IconChartLine,
  IconTrendingUp,
  IconTrendingDown,
  IconBuildingBank,
} from "@tabler/icons-react";
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
    async function fetchBIRate(): Promise<MarketItem | null> {
      // Layer 1: FRED - Indonesia Central Bank Rate
      try {
        const fredCsv =
          "https://fred.stlouisfed.org/graph/fredgraph.csv?id=IRSTCB01IDQ156N";
        const res = await fetch(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(fredCsv)}&t=${Date.now()}`,
        );
        if (res.ok) {
          const text = await res.text();
          const rows = text
            .trim()
            .split("\n")
            .filter((r) => /^\d{4}-\d{2}-\d{2}/.test(r));
          if (rows.length) {
            const last = rows[rows.length - 1].split(",");
            const prev =
              rows.length > 1 ? rows[rows.length - 2].split(",") : last;
            const val = parseFloat(last[1]);
            const prevVal = parseFloat(prev[1]);
            if (!isNaN(val)) {
              const diff = val - prevVal;
              return {
                symbol: "BI RATE",
                name: `Suku Bunga BI • ${last[0]}`,
                price: `${val.toFixed(2)}%`,
                change:
                  diff === 0
                    ? "HOLD"
                    : `${diff > 0 ? "+" : ""}${diff.toFixed(2)}%`,
                isUp: diff <= 0, // Turun/Tetap = Positif bagi pasar
              };
            }
          }
        }
      } catch {}

      // Layer 2: Scrape bi.go.id official
      try {
        const biUrl =
          "https://www.bi.go.id/en/publikasi/ruang-media/news-release/default.aspx";
        const res = await fetch(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(biUrl)}&t=${Date.now()}`,
        );
        if (res.ok) {
          const html = await res.text();
          const match = html.match(/BI-Rate[^%]*?(\d+\.\d+)\s*%/i);
          if (match) {
            return {
              symbol: "BI RATE",
              name: "Suku Bunga BI",
              price: `${match[1]}%`,
              change: "BI Official",
              isUp: true,
            };
          }
        }
      } catch {}

      // Layer 3: TradingEconomics backup
      try {
        const teUrl = "https://tradingeconomics.com/indonesia/interest-rate";
        const res = await fetch(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(teUrl)}&t=${Date.now()}`,
        );
        if (res.ok) {
          const html = await res.text();
          const match = html.match(/(\d+\.\d+)\s*%/);
          if (match) {
            return {
              symbol: "BI RATE",
              name: "Suku Bunga BI",
              price: `${match[1]}%`,
              change: "Live",
              isUp: true,
            };
          }
        }
      } catch {}

      return null;
    }

    async function fetchUsdRate(): Promise<MarketItem | null> {
      try {
        const resUsd = await fetch("https://open.er-api.com/v6/latest/USD");
        if (resUsd.ok) {
          const usdData = await resUsd.json();
          const rate = usdData?.rates?.IDR;
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
      } catch (e) {
        console.error("USD/IDR fail:", e);
      }
      return null;
    }

    async function fetchIhsg(): Promise<MarketItem | null> {
      try {
        const resIhsg = await fetch(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(
            "https://query1.finance.yahoo.com/v7/finance/quote?symbols=^JKSE",
          )}&t=${Date.now()}`,
        );
        if (resIhsg.ok) {
          const yahooData = await resIhsg.json();
          const quote = yahooData?.quoteResponse?.result?.[0];
          if (quote) {
            const price = quote.regularMarketPrice;
            const changePercent = quote.regularMarketChangePercent;
            const isUp = changePercent >= 0;
            return {
              symbol: "IHSG",
              name: "Indeks Saham",
              price: price
                ? price.toLocaleString("id-ID", { minimumFractionDigits: 2 })
                : "N/A",
              change: changePercent
                ? `${isUp ? "+" : ""}${changePercent.toFixed(2)}%`
                : "0.00%",
              isUp,
            };
          }
        }
      } catch (e) {
        console.error("IHSG fail:", e);
      }
      return null;
    }

    async function fetchAllMarketData() {
      // Fetch ketiga indikator secara eksekusi paralel untuk kecepatan optimal
      const results = await Promise.allSettled([
        fetchUsdRate(),
        fetchIhsg(),
        fetchBIRate(),
      ]);

      const items: MarketItem[] = [];
      results.forEach((res) => {
        if (res.status === "fulfilled" && res.value) {
          items.push(res.value);
        }
      });

      setMarketData(items);
      setIsLoading(false);
    }

    fetchAllMarketData();
  }, []);

  return (
    <div className="grid w-full place-items-center py-6">
      <Card className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-white shadow-2xl">
        <CardContent className="p-6 md:p-8">
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h6 className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <IconChartLine size={16} /> Market Indicators
              </h6>
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400"
              >
                LIVE
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {isLoading ? (
                <div className="col-span-3 py-4 text-center text-xs text-white/40">
                  Memuat indikator pasar...
                </div>
              ) : marketData.length > 0 ? (
                marketData.map((item) => {
                  const isBIRate = item.symbol.includes("BI");
                  return (
                    <div
                      key={item.symbol}
                      className={`flex min-h-[90px] flex-col justify-between rounded-lg border p-2.5 ${
                        isBIRate
                          ? "border-amber-500/20 bg-amber-500/5"
                          : "border-white/10 bg-black/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs font-bold text-white">
                          {isBIRate && (
                            <IconBuildingBank
                              size={12}
                              className="text-amber-400"
                            />
                          )}
                          {item.symbol}
                        </span>
                        <Badge
                          className={`flex items-center border-0 px-1.5 py-0.5 text-[10px] ${
                            item.isUp
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-red-500/15 text-red-400"
                          }`}
                        >
                          {item.isUp ? (
                            <IconTrendingUp size={10} className="mr-0.5" />
                          ) : (
                            <IconTrendingDown size={10} className="mr-0.5" />
                          )}
                          {item.change}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {item.price}
                      </div>
                      <div className="text-[11px] text-white/50">
                        {item.name}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 py-4 text-center text-xs text-white/40">
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
                  <IconDashboard size={16} /> Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/journal-entry">
                  <IconNotebook size={16} /> Journal Entry
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
