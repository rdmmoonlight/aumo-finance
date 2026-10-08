import { logger } from '../lib/logger.js';
import type { MarketIndicator } from '../types/market-indicator.type.js';

// Pengganti IHomeService / HomeService + IMarketDataService / MarketDataService C#
// Gabungan 2 implementasi C# kamu jadi 1 service TS yang robust

// Cache IHSG (sama seperti static field di C#)
let ihsgCache: MarketIndicator | null = null;
let ihsgCacheAt = 0;
const IHSG_CACHE_TTL = 5 * 60 * 1000; // 5 menit

const YAHOO_HOSTS = ['query1', 'query2'];
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'application/json, text/plain, */*',
                ...(options.headers as any)
            }
        });
        return res;
    } finally {
        clearTimeout(timeout);
    }
}

function tryReadDecimal(obj: any, prop: string): number | null {
    if (!obj || !(prop in obj)) return null;
    const val = obj[prop];
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
    }
    return null;
}

async function fetchYahooChartData(
    url: string,
    symbol: string,
    name: string
): Promise<MarketIndicator | null> {
    if (!url.startsWith('https://')) {
        throw new Error('Request URL wajib menggunakan protokol HTTPS.');
    }

    try {
        const res = await fetchWithTimeout(url, {}, 5000);
        if (!res.ok) return null;

        const json = await res.json() as any;
        const result = json?.chart?.result;
        if (!result || result.length === 0) return null;

        const meta = result[0]?.meta;
        if (!meta?.regularMarketPrice) return null;

        const price = Number(meta.regularMarketPrice);
        const prevClose = Number(meta.chartPreviousClose ?? meta.previousClose ?? price);
        const changePercent = prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0;

        return {
            symbol,
            name,
            price: Math.round(price * 100) / 100,
            change: Math.round(changePercent * 100) / 100,
            previousClose: prevClose,
            source: 'yahoo'
        };
    } catch (err) {
        logger.warn({ err, url }, 'Failed to fetch Yahoo chart data');
        return null;
    }
}

async function fetchUsdRate(): Promise<MarketIndicator | null> {
    // 1. Coba Yahoo Finance IDR=X
    for (const host of YAHOO_HOSTS) {
        const yahooUrl = `https://${host}.finance.yahoo.com/v8/finance/chart/IDR=X`;
        const result = await fetchYahooChartData(yahooUrl, 'USD/IDR', 'Dolar AS / Rupiah');
        if (result) return result;
    }

    // 2. Fallback: open.er-api.com (sama seperti C#)
    try {
        const res = await fetchWithTimeout('https://open.er-api.com/v6/latest/USD', {}, 5000);
        if (res.ok) {
            const json = await res.json() as any;
            const rate = json?.rates?.IDR;
            if (rate) {
                return {
                    symbol: 'USD/IDR',
                    name: 'Dolar AS / Rupiah',
                    price: Number(rate),
                    change: 0,
                    source: 'er-api'
                };
            }
        }
    } catch (err) {
        logger.warn({ err }, 'Failed to fetch USD/IDR fallback');
    }

    // 3. Fallback kedua: ApiIndonesia kalau ada key (dari MarketDataService kedua)
    try {
        const apiKey = process.env.API_INDONESIA_KEY;
        if (apiKey) {
            const res = await fetchWithTimeout('https://use.apiindonesia.id/api/v1/kurs/latest?base=USD&target=IDR', {
                headers: { 'x-api-key': apiKey } as any
            }, 5000);
            if (res.ok) {
                const json = await res.json() as any;
                if (json?.data?.rate) {
                    return {
                        symbol: 'USD/IDR',
                        name: 'Dolar AS / Rupiah',
                        price: Number(json.data.rate),
                        change: Number(json.data.change || 0),
                        source: 'apiindonesia'
                    };
                }
            }
        }
    } catch (err) {
        logger.warn({ err }, 'Failed to fetch ApiIndonesia kurs');
    }

    return null;
}

async function fetchIhsgFromIdx(): Promise<MarketIndicator | null> {
    // Hari bursa terakhir: mundur maksimal 7 hari dari hari ini (WIB) untuk melewati akhir pekan dan libur
    const todayWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
    todayWib.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const date = new Date(todayWib);
        date.setDate(todayWib.getDate() - i);

        const day = date.getDay();
        if (day === 0 || day === 6) continue; // Sabtu Minggu

        try {
            const yyyyMMdd = date.toISOString().slice(0, 10).replace(/-/g, '');
            const url = `https://www.idx.co.id/primary/TradingSummary/GetIndexSummary?date=${yyyyMMdd}&start=0&length=9999`;

            const res = await fetchWithTimeout(url, {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.idx.co.id/'
                } as any
            }, 5000);

            if (!res.ok) return null; // diblokir atau error: pakai cadangan

            const json = await res.json() as any;
            const dataArray = json?.data;
            if (!Array.isArray(dataArray)) return null;

            for (const item of dataArray) {
                if (String(item.IndexCode || '').toUpperCase() !== 'COMPOSITE') continue;

                const close = tryReadDecimal(item, 'Close');
                if (!close || close <= 0) break;

                const previous = tryReadDecimal(item, 'Previous') || 0;
                const changePercent = previous > 0 ? ((close - previous) / previous) * 100 : 0;

                return {
                    symbol: 'IHSG',
                    name: 'Indeks Harga Saham Gabungan',
                    price: Math.round(close * 100) / 100,
                    change: Math.round(changePercent * 100) / 100,
                    previousClose: previous,
                    source: 'idx'
                };
            }
            // Tidak ada data COMPOSITE pada tanggal ini (libur bursa): coba hari sebelumnya
        } catch (err) {
            logger.warn({ err, date }, 'Failed to fetch IDX data');
            return null;
        }
    }

    return null;
}

async function fetchIhsg(): Promise<MarketIndicator | null> {
    // 1. Cache
    if (ihsgCache && Date.now() - ihsgCacheAt < IHSG_CACHE_TTL) {
        return ihsgCache;
    }

    // 2. Sumber utama: API resmi IDX
    const idxResult = await fetchIhsgFromIdx();
    if (idxResult) {
        ihsgCache = idxResult;
        ihsgCacheAt = Date.now();
        return idxResult;
    }

    // 3. Cadangan: Yahoo Finance ^JKSE
    for (const host of YAHOO_HOSTS) {
        const yahooUrl = `https://${host}.finance.yahoo.com/v8/finance/chart/%5EJKSE`;
        const result = await fetchYahooChartData(yahooUrl, 'IHSG', 'Indeks Harga Saham Gabungan');
        if (result) return result;
    }

    return null;
}

export class HomeService {
    async getMarketIndicators(): Promise<MarketIndicator[]> {
        const [usdResult, ihsgResult] = await Promise.all([
            fetchUsdRate(),
            fetchIhsg()
        ]);

        const result: MarketIndicator[] = [];
        if (usdResult) result.push(usdResult);
        if (ihsgResult) result.push(ihsgResult);

        // Fallback dummy kalau semua API gagal (seperti di MarketDataService kedua)
        if (result.length === 0) {
            logger.warn('All market data sources failed, returning fallback data');
            // Jangan return dummy di production, tapi untuk dev biar UI tidak kosong:
            // result.push({ symbol: 'USD/IDR', name: 'Dolar AS / Rupiah', price: 16250, change: 0, source: 'fallback' });
            // result.push({ symbol: 'IHSG', name: 'Indeks Harga Saham Gabungan', price: 7250.45, change: 0.35, source: 'fallback' });
        }

        return result;
    }
}

// Alias untuk backward compat dengan IMarketDataService C# kedua
export class MarketDataService extends HomeService {
    async getMarketIndicatorsAsync(): Promise<MarketIndicator[]> {
        return this.getMarketIndicators();
    }
}

export const homeService = new HomeService();
export const marketDataService = new MarketDataService();
