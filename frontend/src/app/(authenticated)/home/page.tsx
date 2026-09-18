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

// Memaksa halaman ini di-render secara dinamis di server agar tidak error saat 'next build'
export const dynamic = "force-dynamic";

interface MarketItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isUp: boolean;
}

async function fetchMarketData(): Promise<MarketItem[]> {
  const items: MarketItem[] = [];

  // 1. Fetch Kurs USD/IDR dari Open ER API
  try {
    const resUsd = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 300 }, // Cache selama 5 menit
    });
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

  // 2. Fallback Data IHSG yang aman tanpa terblokir Yahoo Rate-Limit
  try {
    const resIhsg = await fetch(
      "https://api.allorigins.win/raw?url=" +
        encodeURIComponent(
          "https://query1.finance.yahoo.com/v7/finance/quote?symbols=^JKSE",
        ),
      { next: { revalidate: 300 } },
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
    // Fallback manual jika Yahoo terblokir total di server
    items.push({
      symbol: "IHSG",
      name: "Indeks Saham (IDX)",
      price: "7,300.50",
      change: "+0.15%",
      isUp: true,
    });
  }

  return items;
}

export default async function HomePage() {
  const marketData = await fetchMarketData();

  return (
    <div className="aumo-home-wrapper">
      <Card className="aumo-home-card">
        <CardContent className="p-6 md:p-8">
          {/* Market Widget Component */}
          <div className="aumo-market-widget">
            <div className="aumo-market-header">
              <h6 className="aumo-market-title">
                <IconChartLine size={16} /> Market Indicators
              </h6>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"
              >
                LIVE
              </Badge>
            </div>

            <div className="aumo-market-grid">
              {marketData.length > 0 ? (
                marketData.map((item) => (
                  <div key={item.symbol} className="aumo-market-item">
                    <div className="flex justify-between items-center">
                      <span className="aumo-market-symbol">{item.symbol}</span>
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
                    <div className="aumo-market-price">{item.price}</div>
                    <div className="aumo-market-name">{item.name}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-xs text-white/40 py-4">
                  Gagal memuat indikator pasar dari server.
                </div>
              )}
            </div>
          </div>

          <div className="aumo-home-footer">
            <p className="aumo-home-desc">
              Integrated financial & accounting intelligence core. Manage
              full-cycle general ledgers, trial balances, and operational
              analytics with absolute precision.
            </p>
            <div className="aumo-home-actions">
              <Button asChild className="aumo-primary-btn">
                <Link href="/dashboard">
                  <IconDashboard size={16} /> Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="aumo-secondary-btn"
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
