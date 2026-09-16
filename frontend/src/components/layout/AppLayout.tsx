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
          'group flex items-center gap-3 rounded-lg px-3 py-2 text- leading-none transition-colors duration-200',
          isActive
          ? 'bg-[#2a2a2e] text-white font-medium'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] font-[400]'
        )}>
          <item.icon size={18} stroke={1.6} className={cn("shrink-0", isActive? "opacity-100" : "opacity-60 group-hover:opacity-100")} />
          <span className="truncate tracking-[-0.01em]">{item.label}</span>
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
    <aside className="w-64 border-r border-white/[0.06] bg-[#18181b] flex flex-col h-screen sticky top-0 shrink-0 select-none z-20">
      {/* Logo matte */}
      <div className="h-16 px-5 border-b border-white/[0.06] flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#2a2a2e] text-white grid place-items-center font-bold text-">A</div>
        <div className="flex flex-col">
          <span className="font-semibold text- leading-none tracking-tight text-white">Aumo Finance</span>
          <span className="text- text-zinc-500 uppercase tracking-[0.16em] font-medium mt-">Accounting Suite</span>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 py-5 space-y-7">
          <div>
            <h2 className="px-3 mb-3 text- font-semibold text-zinc-500 uppercase tracking-[0.14em]">Main Domain</h2>
            <div className="space-y-0.5">
              {mainNavItems.map((item) => <NavItemLink key={item.path} item={item} />)}
            </div>
          </div>

          <div className="h-px bg-white/[0.06] mx-2" />

          <div>
            <h2 className="px-3 mb-3 text- font-semibold text-zinc-500 uppercase tracking-[0.14em]">Reports & Statements</h2>
            <div className="space-y-0.5">
              {reportNavItems.map((item) => <NavItemLink key={item.path} item={item} />)}
            </div>
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <div className="p-3 border-t border-white/[0.06] bg-[#18181b] shrink-0 space-y-2.5">
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-[#202023] border border-white/[0.06]">
          <div className="w-7 h-7 rounded-full bg-white/[0.06] text-zinc-300 grid place-items-center shrink-0">
            <IconUser size={14} />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text- font-medium truncate text-white leading-none">
              {loading? 'Loading...' : user?.fullName || user?.userName || 'User'}
            </span>
            <span className="text- text-zinc-500 truncate leading-none mt-1.5 font-mono">
              {user?.email || 'Active Session'}
            </span>
          </div>
          <Badge variant="outline" className="px-1.5 py-0 text- gap-1 font-mono border-emerald-500/20 text-emerald-400 bg-emerald-500/10 shrink-0 rounded-md">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />Online
          </Badge>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut} className="w-full justify-start gap-2 h-8 text-[12.5px] text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg">
          {loggingOut? <IconLoader2 size={14} className="animate-spin" /> : <IconLogout size={14} />}
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
    textEn: string; textAr: string; surahName: string; surahNo: number; ayahNo: number;
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

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && measureRef.current) {
        setIsOverflowing(measureRef.current.scrollWidth > containerRef.current.clientWidth + 10);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [verse]);

  const fullText = verse? `"${verse.textEn}" — QS. ${verse.surahName} ${verse.surahNo}:${verse.ayahNo}` : '';

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#18181b] px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 gap-4">
      <style>{`
        @keyframes quran-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
       .animate-quran-marquee {
          animation: quran-marquee 24s linear infinite;
        }
       .group:hover.animate-quran-marquee {
          animation-play-state: paused;
        }
      `}</style>

      <Breadcrumb className="shrink-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/" className="text-zinc-500 hover:text-white text-">Home</Link></BreadcrumbLink>
          </BreadcrumbItem>
          {pathSegments.map((seg, i) => {
            const url = `/${pathSegments.slice(0, i + 1).join('/')}`;
            const isLast = i === pathSegments.length - 1;
            return (
              <div key={url} className="contents">
                <BreadcrumbSeparator className="text-white/20"><IconChevronRight size={14} /></BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isLast? (
                    <BreadcrumbPage className="capitalize text-white text-">{seg.replace(/-/g, ' ')}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={url} className="capitalize text-zinc-500 hover:text-white text-">{seg.replace(/-/g, ' ')}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Quran Verse Matte - Pure White */}
      <div ref={containerRef} className="ml-auto hidden md:flex flex-1 justify-end max-w- overflow-hidden">
        <span ref={measureRef} className="invisible absolute whitespace-nowrap" style={{ fontSize: '10.5px' }}>{fullText}</span>

        {loadingVerse? (
          <div className="flex items-center gap-2" style={{ color: '#FFFFFF' }}>
            <IconLoader2 size={12} className="animate-spin" />
            <span style={{ color: '#FFFFFF', fontSize: '10px' }}>Loading verse...</span>
          </div>
        ) : verse? (
          <div className="group relative w-full flex justify-end">
            {isOverflowing? (
              <div className="flex gap-12 animate-quran-marquee whitespace-nowrap">
                <span style={{ color: '#FFFFFF', fontSize: '10.5px' }} className="font-medium italic shrink-0 tracking-wide">{fullText}</span>
                <span aria-hidden style={{ color: '#FFFFFF', fontSize: '10.5px' }} className="font-medium italic shrink-0 tracking-wide">{fullText}</span>
              </div>
            ) : (
              <p className="truncate text-right font-medium italic tracking-wide" style={{ color: '#FFFFFF', fontSize: '10.5px' }}>{fullText}</p>
            )}

            <div className="absolute right-0 top-full mt-3 hidden group-hover:block z-50 w- rounded-xl bg-[#242427] border border-white/[0.08] p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <p className="text-right leading-relaxed" style={{ color: '#FFFFFF', fontSize: '14px' }}>{verse.textAr}</p>
              <p className="mt-2 text-left leading-relaxed italic" style={{ color: '#FFFFFF', fontSize: '11px' }}>"{verse.textEn}"</p>
              <p className="mt-2 text-left" style={{ color: '#FFFFFF', fontSize: '9px', opacity: 0.5 }}>— QS. {verse.surahName} {verse.surahNo}:{verse.ayahNo}</p>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-[#f5f5f5]">
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
