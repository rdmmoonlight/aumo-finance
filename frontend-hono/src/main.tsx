import { ReduxProvider } from "@/components/redux-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AppRoutes, startRouter } from "@/lib/router";
import "@/styles/index.css";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (!container) throw new Error("Elemen #root tidak ditemukan di index.html");

// 1. Tampilkan UI loading bawaan di elemen #root
container.innerHTML = `
  <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; text-align:center;">
    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
    <p style="margin-top: 16px; font-weight: 600;">Menghubungkan ke server...</p>
    <p style="font-size: 14px; color: #666;">Mohon tunggu sebentar, server sedang disiapkan.</p>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </div>
`;

// 2. Fungsi ping berulang
async function pingBackend(maxRetries = 20, delayMs = 3000) {
  const apiUrl = import.meta.env.VITE_WEB_API_URL;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(apiUrl, { method: "GET" });
      if (res.ok) return true;
    } catch {
      // Server masih booting/down, lanjut retry
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}

// 3. Tahan rendering sampai backend bangun
(async () => {
  await pingBackend();

  // Reset isi container sebelum React di-mount
  container.innerHTML = "";

  // Daftarkan rute Navigo & Render React
  startRouter();

  createRoot(container).render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ReduxProvider>
        <AppRoutes />
      </ReduxProvider>
    </ThemeProvider>,
  );
})();
