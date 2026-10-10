/**
 * Integrasi Navigo + React.
 *
 * - Navigo mengatur URL & pencocokan rute (satu instance, dibuat di level modul)
 * - Halaman diambil otomatis dari src/app/**\/page.tsx (route group "(x)" dibuang dari URL)
 * - React hanya di-mount SATU kali; pergantian halaman lewat state, bukan unmount root
 * - Menyediakan Link, useNavigate, useLocation, useSearchParams dengan bentuk yang sama
 *   seperti react-router-dom, sehingga halaman lama cukup mengganti sumber import.
 */
import Navigo from "navigo";
import {
  Suspense,
  forwardRef,
  lazy,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ComponentType,
  type MouseEvent,
} from "react";

// ==========================================
// 1. Daftar rute dari struktur folder
// ==========================================
type PageModule = { default: ComponentType };

const pageModules = import.meta.glob<PageModule>("../app/**/page.tsx");

function toPath(file: string): string {
  const path = file
    .replace("../app", "")
    .replace(/\/page\.tsx$/, "")
    .replace(/\/\([^)]+\)/g, ""); // buang route group, mis. (authenticated)
  return path === "" ? "/" : path;
}

type RouteEntry = {
  path: string;
  authenticated: boolean;
  Page: ComponentType;
};

const routes: RouteEntry[] = Object.entries(pageModules).map(
  ([file, loader]) => ({
    path: toPath(file),
    authenticated: file.includes("/(authenticated)/"),
    Page: lazy(loader),
  }),
);

const AuthenticatedLayout = lazy(() => import("../app/(authenticated)/layout"));

// ==========================================
// 2. Store lokasi + rute aktif (dibaca React lewat useSyncExternalStore)
// ==========================================
type Snapshot = {
  pathname: string;
  search: string;
  hash: string;
  route: RouteEntry | null;
  /** true setelah Navigo selesai mencocokkan URL pertama kali */
  resolved: boolean;
};

let snapshot: Snapshot = {
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
  route: null,
  resolved: false,
};
const listeners = new Set<() => void>();

function commit(route: RouteEntry | null) {
  snapshot = {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    route,
    resolved: true,
  };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => snapshot;

// ==========================================
// 3. Instance Navigo (sekali, di level modul)
// ==========================================
export const router = new Navigo("/", { hash: false });

let started = false;

/** Daftarkan seluruh rute lalu resolve URL saat ini. Panggil sekali dari main.tsx. */
export function startRouter() {
  if (started) return;
  started = true;

  for (const route of routes) {
    router.on(route.path, () => commit(route));
  }
  router.notFound(() => commit(null));
  router.resolve();
}

// ==========================================
// 4. API navigasi (kompatibel react-router-dom)
// ==========================================
type NavigateOptions = { replace?: boolean };

export function navigate(to: string | number, options: NavigateOptions = {}) {
  if (typeof to === "number") {
    window.history.go(to);
    return;
  }
  router.navigate(to, {
    historyAPIMethod: options.replace ? "replaceState" : "pushState",
  });
}

export function useNavigate() {
  return useCallback(
    (to: string | number, options?: NavigateOptions) => navigate(to, options),
    [],
  );
}

export function useLocation() {
  const { pathname, search, hash } = useSyncExternalStore(
    subscribe,
    getSnapshot,
  );
  return { pathname, search, hash };
}

export function useSearchParams(): [
  URLSearchParams,
  (
    next: URLSearchParams | Record<string, string>,
    options?: NavigateOptions,
  ) => void,
] {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const setParams = useCallback(
    (
      next: URLSearchParams | Record<string, string>,
      options?: NavigateOptions,
    ) => {
      const qs = new URLSearchParams(next).toString();
      navigate(`${window.location.pathname}${qs ? `?${qs}` : ""}`, options);
    },
    [],
  );

  return [params, setParams];
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  replace?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, onClick, target, ...rest },
  ref,
) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      (target && target !== "_self") ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      /^https?:\/\//.test(to) // link eksternal: biarkan browser
    ) {
      return;
    }
    e.preventDefault();
    navigate(to, { replace });
  };

  return (
    <a ref={ref} href={to} target={target} onClick={handleClick} {...rest} />
  );
});

// ==========================================
// 5. Komponen outlet: menampilkan halaman aktif
// ==========================================
function Splash() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Memuat...</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-background">
      <h1 className="text-lg font-semibold">404 - Halaman tidak ditemukan</h1>
      <Link to="/" className="text-sm underline">
        Kembali ke beranda
      </Link>
    </div>
  );
}

export function AppRoutes() {
  const { route, resolved } = useSyncExternalStore(subscribe, getSnapshot);

  if (!resolved) return <Splash />;
  if (!route) return <NotFound />;

  const { Page, authenticated, path } = route;

  return (
    <Suspense fallback={<Splash />}>
      {authenticated ? (
        <AuthenticatedLayout>
          <Suspense fallback={null}>
            <Page key={path} />
          </Suspense>
        </AuthenticatedLayout>
      ) : (
        <Page key={path} />
      )}
    </Suspense>
  );
}
