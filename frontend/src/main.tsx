import { ReduxProvider } from "@/components/redux-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AppRoutes, startRouter } from "@/lib/router";
import "@/styles/index.css";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (!container) throw new Error("Elemen #root tidak ditemukan di index.html");

// Daftarkan rute Navigo lebih dulu, lalu mount React satu kali saja.
startRouter();

createRoot(container).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <ReduxProvider>
      <AppRoutes />
    </ReduxProvider>
  </ThemeProvider>,
);
