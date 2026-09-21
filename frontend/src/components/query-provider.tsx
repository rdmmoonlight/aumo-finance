"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Menggunakan useState agar QueryClient di-instantiate sekali per halaman di client side
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data dianggap segar selama 5 menit (mencegah refetch berlebih)
            staleTime: 1000 * 60 * 5,
            // Tidak re-fetch otomatis saat window browser fokus kembali
            refetchOnWindowFocus: false,
            // Coba lagi 1 kali jika request gagal sebelum melempar error
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools hanya akan muncul di environment development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}