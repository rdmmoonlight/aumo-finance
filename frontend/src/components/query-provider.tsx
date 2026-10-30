import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    // Menggunakan useState initializer agar QueryClient hanya dibuat sekali per lifecycle instance
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Durasi data dianggap 'fresh' sebelum butuh background refetch (5 menit)
                        staleTime: 1000 * 60 * 5,
                        // Durasi cache disimpan di memory sebelum di-garbage collect (10 menit)
                        gcTime: 1000 * 60 * 10,
                        // Jumlah percobaan ulang jika fetch gagal
                        retry: 1,
                        // Tidak auto-refetch saat window kembali fokus (opsional, sesuaikan kebutuhan app)
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* Devtools hanya akan aktif/rendebable pada environment development */}
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        </QueryClientProvider>
    );
}