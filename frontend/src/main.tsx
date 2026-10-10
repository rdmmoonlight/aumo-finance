import { ReduxProvider } from "@/components/redux-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AppRoutes, startRouter } from "@/lib/router";
import "@/styles/index.css";
import { createRoot } from "react-dom/client";

const container = document.getElementById("app");
if (!container) throw new Error("Elemen #app tidak ditemukan di index.html");

// Daftarkan rute Navigo lebih dulu, lalu mount React satu kali saja.
startRouter();

createRoot(container).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <ReduxProvider>
      <AppRoutes />
    </ReduxProvider>
  </ThemeProvider>,
);
