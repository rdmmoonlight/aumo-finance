'use client'

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconDashboard,
  IconNotebook,
  IconChartLine,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MarketItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isUp: boolean;
}

async function fetchMarketData(): Promise<MarketItem[]> {
  const items: MarketItem[] = [];

  // 1. Fetch Kurs USD/IDR dari API Server
  try {
    const resUsd = await fetch('https://open.er-api.com/v6/latest/USD', {
      cache: 'no-store',
    });
    if (resUsd.ok) {
      const usdData = await resUsd.json();
      const rate = usdData?.rates?.IDR;
      if (rate) {
        items.push({
          symbol: 'USD/IDR',
          name: 'Rupiah',
          price: `Rp ${rate.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`,
          change: 'Live',
          isUp: true,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching USD/IDR:', error);
  }

  // 2. Fetch Data IHSG (^JKSE) dari Yahoo Finance API
  try {
    const resYahoo = await fetch(
      'https://query1.finance.yahoo.com/v7/finance/quote?symbols=^JKSE',
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        cache: 'no-store',
      }
    );

    if (resYahoo.ok) {
      const yahooData = await resYahoo.json();
      const quote = yahooData?.quoteResponse?.result?.[0];

      if (quote) {
        const price = quote.regularMarketPrice;
        const changePercent = quote.regularMarketChangePercent;
        const isUp = changePercent >= 0;

        items.push({
          symbol: 'IHSG',
          name: 'Indeks Saham',
          price: price ? price.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : 'N/A',
          change: changePercent ? `${isUp ? '+' : ''}${changePercent.toFixed(2)}%` : '0.00%',
          isUp,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching Yahoo Finance data:', error);
  }

  return items;
}

export default function HomePage() {
  return (
    <div className="w-full grid place-items-center py-6">
      <Card className="w-full max-w-2xl bg-[#0F172A] border-white/10 shadow-2xl rounded-2xl text-white">
        <CardContent className="p-6 md:p-8">
          <MarketWidget />
          <div className="text-center mt-6">
            <p className="text-sm leading-relaxed text-white/80 max-w-md mx-auto">
              Integrated financial & accounting intelligence core. Manage
              full-cycle general ledgers, trial balances, and operational
              analytics with absolute precision.
            </p>
            <div className="flex justify-center gap-3 mt-6 flex-wrap">
              <Button
                asChild
                className="rounded-xl bg-gradient-to-br from-indigo-500/80 to-violet-600/80 border border-indigo-300/20 shadow-lg hover:from-indigo-500 hover:to-violet-600 text-white"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <IconDashboard size={16} /> Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="rounded-xl bg-white/10 text-white hover:bg-white/15 border border-white/10"
              >
                <Link href="/journal-entry" className="flex items-center gap-2">
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

function MarketWidget() {
  const router = useRouter();
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    const data = await fetchMarketData();
    setMarketData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    startTransition(async () => {
      await loadData();
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl bg-slate-900/80 border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h6 className="text-sm font-bold flex items-center gap-2 text-amber-400">
          <IconChartLine size={16} /> Market Indicators
        </h6>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white/60 hover:text-white"
            onClick={handleRefresh}
            disabled={loading || isPending}
          >
            <IconRefresh size={14} className={loading || isPending ? 'animate-spin' : ''} />
          </Button>
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"
          >
            LIVE
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {loading ? (
          <div className="col-span-3 text-center text-xs text-white/40 py-4">
            Memuat indikator pasar dari server...
          </div>
        ) : marketData.length > 0 ? (
          marketData.map((item) => (
            <div
              key={item.symbol}
              className="rounded-lg border border-white/10 bg-black/40 p-2.5 flex flex-col justify-between min-h-[76px]"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">
                  {item.symbol}
                </span>
                <Badge
                  className={`text-[10px] ${
                    item.isUp
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
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
              <div className="text-sm font-semibold text-white mt-1">
                {item.price}
              </div>
              <div className="text-[11px] text-white/50">{item.name}</div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-xs text-white/40 py-4">
            Gagal memuat indikator pasar dari server.
          </div>
        )}
      </div>
    </div>
  );
        }
      
