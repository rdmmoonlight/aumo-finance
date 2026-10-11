/**
 * Integrasi Navigo + React dengan Logging Lengkap.
 *
 * - Navigo mengatur URL & pencocokan rute
 * - Halaman diambil otomatis dari src/app/**/page.*
 */
import Navigo from "navigo";
import {
  Suspense,
  forwardRef,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ComponentType,
  type MouseEvent,
} from "react";

// ==========================================
// 1. Daftar rute dari struktur folder
// ==========================================
type PageModule = { default: ComponentType };

export type VanillaContext = {
  path: string;
  query: URLSearchParams;
  navigate: typeof navigate;
};

export type VanillaPage = (
  container: HTMLElement,
  ctx: VanillaContext,
) => void | (() => void) | Promise<void | (() => void)>;
type VanillaModule = { default: VanillaPage };

const reactModules = import.meta.glob<PageModule>("../app/**/page.tsx");
const vanillaModules = import.meta.glob<VanillaModule>(
  "../app/**/page.{ts,js}",
);

function toPath(file: string): string {
  let path = file
    .replace("../app", "")
    .replace(/\/page\.(tsx|ts|js)$/, "")
    .replace(/\/\([^)]+\)/g, "");

  if (path === "" || path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

type RouteEntry = {
  path: string;
  authenticated: boolean;
  kind: "react" | "vanilla";
  Page: ComponentType;
  filePath: string;
};

function buildRoutes(): RouteEntry[] {
  console.log("[router] Memulai pemindaian file modul...");
  const map = new Map<string, RouteEntry>();

  // Parse Vanilla JS Modules
  for (const [file, load] of Object.entries(vanillaModules)) {
    const path = toPath(file);
    console.log(`[router] File Vanilla terdeteksi: ${file} -> Path: "${path}"`);
    map.set(path, {
      path,
      authenticated: file.includes("/(authenticated)/"),
      kind: "vanilla",
      Page: () => <VanillaHost load={load} path={path} filePath={file} />,
      filePath: file,
    });
  }

  // Parse React Modules
  for (const [file, load] of Object.entries(reactModules)) {
    const path = toPath(file);
    if (map.has(path)) {
      console.warn(
        `[router] Bentrok pada path "${path}": Memiliki halaman React & Vanilla. Mengutamakan React (${file}).`,
      );
    } else {
      console.log(`[router] File React terdeteksi: ${file} -> Path: "${path}"`);
    }

    const LazyComponent = lazy(async () => {
      console.log(`[router] Memuat modul (lazy) untuk path "${path}" dari: ${file}`);
      try {
        const mod = await load();
        if (!mod.default) {
          console.error(
            `[router] ERROR: File ${file} tidak memiliki "export default"! Halaman akan blank/error.`,
          );
        }
        return { default: mod.default };
      } catch (err) {
        console.error(`[router] Gagal mengimpor modul React ${file}:`, err);
        throw err;
      }
    });

    map.set(path, {
      path,
      authenticated: file.includes("/(authenticated)/"),
      kind: "react",
      Page: LazyComponent,
      filePath: file,
    });
  }

  const result = [...map.values()];
  console.log(`[router] Total ${result.length} rute berhasil dibangun:`, result);
  return result;
}

/** Host untuk merender Vanilla JS ke dalam kontainer React */
function VanillaHost({
  load,
  path,
  filePath,
}: {
  load: () => Promise<VanillaModule>;
  path: string;
  filePath: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { search } = useLocation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let disposed = false;
    let cleanup: void | (() => void);

    console.log(`[router] Memasang (mount) Vanilla Page: "${path}" (${filePath})`);

    const onClick = (e: globalThis.MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      const href = a?.getAttribute("href");
      if (!a || !href || !href.startsWith("/") || href.startsWith("//")) return;
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        (a.target && a.target !== "_self") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      e.preventDefault();
      console.log(`[router] Intersepsi klik link vanilla ke: ${href}`);
      navigate(href);
    };
    el.addEventListener("click", onClick);

    load()
      .then(async (mod) => {
        if (disposed) return;
        el.innerHTML = "";
        console.log(`[router] Eksekusi fungsi default export vanilla untuk: ${path}`);
        const result = await mod.default(el, {
          path,
          query: new URLSearchParams(search),
          navigate,
        });
        if (disposed) {
          if (typeof result === "function") result();
        } else {
          cleanup = result;
        }
      })
      .catch((err) => {
        console.error(`[router] Gagal mengeksekusi halaman vanilla ${path}:`, err);
        if (!disposed) {
          el.innerHTML =
            '<div class="p-6 text-sm text-destructive">Gagal memuat halaman.</div>';
        }
      });

    return () => {
      console.log(`[router] Melepas (unmount) Vanilla Page: "${path}"`);
      disposed = true;
      el.removeEventListener("click", onClick);
      if (typeof cleanup === "function") cleanup();
      el.innerHTML = "";
    };
  }, [load, path, search, filePath]);

  return <div ref={ref} data-vanilla-page={path} />;
}

const routes: RouteEntry[] = buildRoutes();

const AuthenticatedLayout = lazy(async () => {
  console.log("[router] Memuat AuthenticatedLayout...");
  try {
    const mod = await import("../app/(authenticated)/layout");
    return { default: mod.default };
  } catch (err) {
    console.warn(
      "[router] AuthenticatedLayout tidak ditemukan. Menggunakan fallback React.Fragment.",
      err,
    );
    return {
      default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
  }
});

// ==========================================
// 2. Store lokasi + rute aktif
// ==========================================
type Snapshot = {
  pathname: string;
  search: string;
  hash: string;
  route: RouteEntry | null;
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
  if (route) {
    console.log(
      `[router] Rute cocok: "${route.path}" | Authenticated: ${route.authenticated} | Jenis: ${route.kind} | File: ${route.filePath}`,
    );
  } else {
    console.warn(
      `[router] Rute TIDAK DITEMUKAN (404) untuk URL: "${window.location.pathname}"`,
    );
  }

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
// 3. Instance Navigo
// ==========================================
export const router = new Navigo("/", { hash: false });

let started = false;

export function startRouter() {
  if (started) {
    console.warn("[router] startRouter() dipanggil lebih dari satu kali. Dibatalkan.");
    return;
  }
  started = true;
  console.log("[router] Memulai registrasi rute ke Navigo...");

  for (const route of routes) {
    router.on(route.path, () => {
      console.log(`[router] Navigo memicu rute: "${route.path}"`);
      commit(route);
    });
  }

  router.notFound(() => {
    console.warn(`[router] Navigo memicu notFound untuk URL: ${window.location.pathname}`);
    commit(null);
  });

  console.log(`[router] Resolving URL awal: "${window.location.pathname}"`);
  router.resolve();
}

// ==========================================
// 4. API Navigasi
// ==========================================
type NavigateOptions = { replace?: boolean };

export function navigate(to: string | number, options: NavigateOptions = {}) {
  console.log(`[router] Perintah navigasi dipanggil ke:`, to, options);
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
      /^https?:\/\//.test(to)
    ) {
      return;
    }
    e.preventDefault();
    console.log(`[router] Element <Link> diklik menuju: ${to}`);
    navigate(to, { replace });
  };

  return (
    <a ref={ref} href={to} target={target} onClick={handleClick} {...rest} />
  );
});

// ==========================================
// 5. Outlet UI
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

  if (!resolved) {
    console.log("[router] Rendering <Splash /> (Router belum resolved)");
    return <Splash />;
  }

  if (!route) {
    console.log("[router] Rendering <NotFound /> (URL tidak cocok rute mana pun)");
    return <NotFound />;
  }

  const { Page, authenticated, path, filePath } = route;
  console.log(`[router] Rendering komponen halaman untuk: "${path}" (${filePath})`);

  return (
    <Suspense fallback={<Splash />}>
      {authenticated ? (
        <AuthenticatedLayout>
          <Suspense fallback={<Splash />}>
            <Page key={path} />
          </Suspense>
        </AuthenticatedLayout>
      ) : (
        <Page key={path} />
      )}
    </Suspense>
  );
}
