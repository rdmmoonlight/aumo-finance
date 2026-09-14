import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data dianggap segar selama 5 menit untuk mengurangi fetching berlebih di mobile
      staleTime: 1000 * 60 * 5,
      // Waktu penyimpanan cache selama 10 menit
      gcTime: 1000 * 60 * 10,
      // Melakukan retry maksimal 2 kali jika ada kegagalan network
      retry: 2,
      // Matikan refetch otomatis saat aplikasi regain focus/layar dinyalakan (bisa diaktifkan sesuai kebutuhan)
      refetchOnWindowFocus: false,
      // Refetch otomatis saat koneksi internet terhubung kembali
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});