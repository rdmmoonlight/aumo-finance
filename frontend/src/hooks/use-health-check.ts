import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export type DbStatus = "connecting" | "online" | "offline";

export function useHealthCheck() {
  const query = useQuery({
    queryKey: ["db-health-check"],
    queryFn: async () => {
      // Sesuaikan endpoint dengan API backend Anda (misal: /api/v1/health atau /health)
      const { data } = await apiClient.get("/api/v1/health");
      return data;
    },
    // Pengaturan ideal untuk Wake-Up Call & Realtime Status:
    refetchInterval: 30000, // Cek status otomatis setiap 30 detik
    retry: 3, // Coba lagi hingga 3x saat backend/DB proses bangun dari tidur
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Delay bertahap
  });

  let status: DbStatus = "connecting";

  if (query.isSuccess) {
    status = "online";
  } else if (query.isError) {
    status = "offline";
  } else if (query.isLoading || query.isFetching) {
    status = "connecting";
  }

  return {
    status,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
