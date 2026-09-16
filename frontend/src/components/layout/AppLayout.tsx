import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, Link } from '@tanstack/react-router';
import {
  IconLayoutDashboard, IconListDetails, IconFilePencil, IconCalendarTime,
  IconRobot, IconShieldCheck, IconTools, IconSettings, IconBook, IconFileCheck,
  IconLock, IconNotebook, IconScale, IconReceipt2, IconPigMoney, IconBuildingBank,
  IconCash, IconTable, IconBuildingStore, IconScaleOff, IconLogout, IconChevronRight,
  IconLoader2, IconUser
} from '@tabler/icons-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import apiClient from '@/lib/apiClient';

interface MenuItem { label: string; path: string; icon: React.ElementType; }
interface UserProfile { userId?: string; email?: string; userName?: string; fullName?: string; }

const mainNavItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: IconLayoutDashboard },
  { label: 'Chart of Accounts', path: '/chart-of-accounts', icon: IconListDetails },
  { label: 'Journal Entry', path: '/journal-entry', icon: IconFilePencil },
  { label: 'Periods', path: '/periods', icon: IconCalendarTime },
  { label: 'AI Assistant', path: '/aiassistant', icon: IconRobot },
  { label: 'Guardian', path: '/guardian', icon: IconShieldCheck },
  { label: 'Tools', path: '/tools', icon: IconTools },
  { label: 'Settings', path: '/settings', icon: IconSettings },
];

const reportNavItems: MenuItem[] = [
  { label: 'General Journal', path: '/reports/general-journal', icon: IconBook },
  { label: 'Adjusting Journal', path: '/reports/adjusting-journal', icon: IconFileCheck },
  { label: 'Closing Journal', path: '/reports/closing-journal', icon: IconLock },
  { label: 'Permanent Ledger', path: '/reports/general-ledger-permanent', icon: IconNotebook },
  { label: 'Temporary Ledger', path: '/reports/general-ledger-temporary', icon: IconNotebook },
  { label: 'Unadjusted Trial Balance', path: '/reports/unadjusted-trial-balance', icon: IconScale },
  { label: 'Adjusted Trial Balance', path: '/reports/adjusted-trial-balance', icon: IconScaleOff },
  { label: 'Post-Closing Trial Balance', path: '/reports/post-closing-trial-balance', icon: IconReceipt2 },
  { label: 'Income Statement', path: '/reports/income-statement', icon: IconPigMoney },
  { label: 'Retained Earnings', path: '/reports/retained-earnings', icon: IconBuildingBank },
  { label: 'Financial Position', path: '/reports/statement-of-financial-position', icon: IconBuildingStore },
  { label: 'Cash Flow', path: '/reports/statement-of-cash-flow', icon: IconCash },
  { label: 'Worksheet', path: '/reports/worksheet', icon: IconTable },
];

function NavItemLink({ item }: { item: MenuItem }) {
  return (
    <Link to={item.path} className="block">
      {({ isActive }: { isActive: boolean }) => (
        <div className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}>
          <item.icon size={18} stroke={1.8} className="shrink-0" />
          <span className="truncate">{item.label}</span>
        </div>
      )}
    </Link>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchUserProfile() {
      try {
        const res = await apiClient.get('/api/v1/auth/me');
        if (isMounted && res.data) setUser(res.data);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUserProfile();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await apiClient.post('/api/v1/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      sessionStorage.clear();
      setLoggingOut(false);
      navigate({ to: '/auth' });
    }
  };

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-screen sticky top-0 shrink-0 select-none z-20">
      <div className="h-16 px-5 border-b flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold shadow-sm">A</div>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-none tracking-tight">Aumo Finance</span>
          <span className="text- text-muted-foreground uppercase tracking-widest font-semibold mt-1">Accounting Suite</span>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 py-4 space-y-6">
          <div>
            <h2 className="px-3 mb-2 text- font-bold text-muted-foreground/70 uppercase tracking-widest">Main Domain</h2>
            <div className="space-y-1">
              {mainNavItems.map((item) => <NavItemLink key={item.path} item={item} />)}
            </div>
          </div>
          <Separator />
          <div>
            <h2 className="px-3 mb-2 text- font-bold text-muted-foreground/70 uppercase tracking-widest">Reports & Statements</h2>
            <div className="space-y-1">
              {reportNavItems.map((item) => <NavItemLink key={item.path} item={item} />)}
            </div>
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <div className="p-3 border-t bg-card shrink-0 space-y-2">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-muted/40 border border-border/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
              <IconUser size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate">{loading? 'Loading...' : user?.fullName || user?.userName || 'User'}</span>
              <span className="text- text-muted-foreground truncate font-mono">{user?.email || 'Active Session'}</span>
            </div>
          </div>
          <Badge variant="outline" className="px-1.5 py-0.5 text- gap-1 font-mono border-emerald-500/30 text-emerald-600 bg-emerald-500/5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Online
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut} className="w-full justify-start gap-2.5 h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
          {loggingOut? <IconLoader2 size={16} className="animate-spin" /> : <IconLogout size={16} />}
          <span>{loggingOut? 'Logging out...' : 'Sign Out'}</span>
        </Button>
      </div>
    </aside>
  );
}

export function Topbar() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const [verse, setVerse] = useState<{
    textEn: string;
    textAr: string;
    surahName: string;
    surahNo: number;
    ayahNo: number;
  } | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(true);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fetchRandomVerse = async () => {
      try {
        setLoadingVerse(true);
        const res = await fetch('https://api.alquran.cloud/v1/ayah/random/editions/quran-uthmani,en.sahih');
        const json = await res.json();
        const ar = json.data[0];
        const en = json.data[1];
        setVerse({
          textAr: ar.text,
          textEn: en.text,
          surahName: en.surah.englishName,
          surahNo: en.surah.number,
          ayahNo: en.numberInSurah,
        });
      } catch {
        setVerse({
          textAr: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
          textEn: 'Indeed, with hardship [will be] ease.',
          surahName: 'Ash-Sharh',
          surahNo: 94,
          ayahNo: 6,
        });
      } finally {
        setLoadingVerse(false);
      }
    };
    fetchRandomVerse();
  }, [location.pathname]);

  // Deteksi apakah text kepanjangan
  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && measureRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = measureRef.current.scrollWidth;
        setIsOverflowing(textWidth > containerWidth + 10);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [verse]);

  const fullText = verse? `"${verse.textEn}" — QS. ${verse.surahName} ${verse.surahNo}:${verse.ayahNo}` : '';

  return (
    <header className="h-16 border-b border-zinc-800 bg-[#0e0e10] px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 gap-4">
      <style>{`
        @keyframes quran-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
       .animate-quran-marquee {
          animation: quran-marquee 20s linear infinite;
          will-change: transform;
        }
       .group:hover.animate-quran-marquee {
          animation-play-state: paused;
        }
      `}</style>

      <Breadcrumb className="shrink-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/" className="text-white/60 hover:text-white">Home</Link></BreadcrumbLink>
          </BreadcrumbItem>
          {pathSegments.map((seg, i) => {
            const url = `/${pathSegments.slice(0, i + 1).join('/')}`;
            const isLast = i === pathSegments.length - 1;
            return (
              <div key={url} className="contents">
                <BreadcrumbSeparator className="text-white/20"><IconChevronRight size={14} /></BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isLast? (
                    <BreadcrumbPage className="capitalize text-white">{seg.replace(/-/g, ' ')}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={url} className="capitalize text-white/60 hover:text-white">{seg.replace(/-/g, ' ')}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Quran Verse Area - Pure White */}
      <div ref={containerRef} className="ml-auto hidden md:flex flex-1 justify-end max-w- overflow-hidden">
        {/* hidden measure untuk cek overflow */}
        <span ref={measureRef} className="invisible absolute whitespace-nowrap" style={{ fontSize: '10.5px' }}>
          {fullText}
        </span>

        {loadingVerse? (
          <div className="flex items-center gap-2" style={{ color: '#FFFFFF' }}>
            <IconLoader2 size={12} className="animate-spin" />
            <span style={{ color: '#FFFFFF', fontSize: '10px' }}>Loading verse...</span>
          </div>
        ) : verse? (
          <div className="group relative w-full flex justify-end">
            {isOverflowing? (
              // JALAN OTOMATIS KALO GA CUKUP
              <div className="flex gap-10 animate-quran-marquee whitespace-nowrap">
                <span style={{ color: '#FFFFFF', fontSize: '10.5px' }} className="font-medium italic shrink-0">
                  {fullText}
                </span>
                <span aria-hidden style={{ color: '#FFFFFF', fontSize: '10.5px' }} className="font-medium italic shrink-0">
                  {fullText}
                </span>
              </div>
            ) : (
              // DIAM KALO CUKUP
              <p className="truncate text-right font-medium italic" style={{ color: '#FFFFFF', fontSize: '10.5px' }}>
                {fullText}
              </p>
            )}

            {/* Tooltip full pas hover */}
            <div className="absolute right-0 top-full mt-3 hidden group-hover:block z-50 w- rounded-lg bg-zinc-900 p-3.5 shadow-2xl ring-1 ring-white/10">
              <p className="text-right leading-relaxed" style={{ color: '#FFFFFF', fontSize: '14px' }}>{verse.textAr}</p>
              <p className="mt-2 text-left leading-relaxed italic" style={{ color: '#FFFFFF', fontSize: '11px' }}>"{verse.textEn}"</p>
              <p className="mt-2 text-left" style={{ color: '#FFFFFF', fontSize: '9px', opacity: 0.6 }}>— QS. {verse.surahName} {verse.surahNo}:{verse.ayahNo}</p>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
