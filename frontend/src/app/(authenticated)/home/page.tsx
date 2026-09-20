"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconDashboard,
  IconNotebook,
  IconChartLine,
  IconTrendingUp,
  IconTrendingDown,
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
    async function fetchMarketData() {
      const items: MarketItem[] = [];

      // 1. Fetch Kurs USD/IDR
      try {
        const resUsd = await fetch("https://open.er-api.com/v6/latest/USD");
        if (resUsd.ok) {
          const usdData = await resUsd.json();
          const rate = usdData?.rates?.IDR;
          if (rate) {
            items.push({
              symbol: "USD/IDR",
              name: "Rupiah",
              price: `Rp ${Math.round(rate).toLocaleString("id-ID")}`,
              change: "Live",
              isUp: true,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching USD/IDR:", error);
      }

      // 2. Fetch Data IHSG
      try {
        const resIhsg = await fetch(
          "https://api.allorigins.win/raw?url=" +
            encodeURIComponent(
              "https://query1.finance.yahoo.com/v7/finance/quote?symbols=^JKSE"
            )
        );

        if (resIhsg.ok) {
          const yahooData = await resIhsg.json();
          const quote = yahooData?.quoteResponse?.result?.[0];

          if (quote) {
            const price = quote.regularMarketPrice;
            const changePercent = quote.regularMarketChangePercent;
            const isUp = changePercent >= 0;

            items.push({
              symbol: "IHSG",
              name: "Indeks Saham",
              price: price
                ? price.toLocaleString("id-ID", { minimumFractionDigits: 2 })
                : "N/A",
              change: changePercent
                ? `${isUp ? "+" : ""}${changePercent.toFixed(2)}%`
                : "0.00%",
              isUp,
            });
          }
        }
      } catch {
        // Fallback manual jika gagal
        items.push({
          symbol: "IHSG",
          name: "Indeks Saham (IDX)",
          price: "7,300.50",
          change: "+0.15%",
          isUp: true,
        });
      }

      setMarketData(items);
      setIsLoading(false);
    }

    fetchMarketData();
  }, []);

  return (
    <div className="grid w-full place-items-center py-6">
      <Card className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-white shadow-2xl">
        <CardContent className="p-6 md:p-8">
          {/* Market Widget Component */}
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h6 className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <IconChartLine size={16} /> Market Indicators
              </h6>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"
              >
                LIVE
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {isLoading ? (
                <div className="col-span-2 text-center text-xs text-white/40 py-4">
                  Memuat indikator pasar...
                </div>
              ) : marketData.length > 0 ? (
                marketData.map((item) => (
                  <div
                    key={item.symbol}
                    className="flex min-h-[76px] flex-col justify-between rounded-lg border border-white/10 bg-black/40 p-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">
                        {item.symbol}
                      </span>
                      <Badge
                        className={`text-[10px] ${
                          item.isUp
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        } border-0 flex items-center px-1.5 py-0.5`}
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
                    <div className="text-[11px] text-white/50">{item.name}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-xs text-white/40 py-4">
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
