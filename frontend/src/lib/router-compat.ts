import { useLocation, useRouter } from "@tanstack/react-router";
import { useMemo } from "react";

/**
 * Pengganti `useSearchParams` milik Next.js untuk TanStack Router.
 * Mengembalikan URLSearchParams dari query string URL saat ini.
 */
export function useSearchParams(): URLSearchParams {
  const searchStr = useLocation({ select: (l) => l.searchStr });
  return useMemo(() => new URLSearchParams(searchStr), [searchStr]);
}

/**
 * Pengganti `useRouter` milik Next.js (push/replace/back) di atas history
 * TanStack Router. Menerima href string lengkap, termasuk query dan hash.
 */
export function useAppRouter() {
  const router = useRouter();
  return useMemo(
    () => ({
      push: (href: string) => router.history.push(href),
      replace: (href: string) => router.history.replace(href),
      back: () => router.history.back(),
    }),
    [router],
  );
}
