import "@/styles/index.css";
import Navigo from "navigo";

// Tipe modul untuk dynamic import halaman Vanilla JS
type PageModule = {
  default: (container: HTMLElement) => void | Promise<void>;
};

// Ambil semua halaman modul (direvisi ke file .ts / .js)
const modules = import.meta.glob<PageModule>("./app/**/page.ts");

// Helper untuk mengubah path file menjadi route URL
function toPath(file: string): string {
  const path = file
    .replace("./app", "")
    .replace(/\/page\.ts$/, "")
    .replace(/\/\([^)]+\)/g, ""); // Hapus route group seperti (authenticated)
  return path === "" ? "/" : path;
}

// Inisialisasi Navigo Router (tanpa hash)
const router = new Navigo("/", { hash: false });

// Element root di index.html
const appElement = document.getElementById("root") as HTMLElement;

// Render Layout Utama untuk area authenticated
function renderLayout(contentHtml: string = ""): string {
  return `
    <div class="min-h-screen flex flex-col bg-background text-foreground">
      <header class="border-b p-4 font-bold">Aumo Finance Header</header>
      <div class="flex-1 flex">
        <aside class="w-64 border-r p-4 hidden md:block">
          <nav class="space-y-2">
            <a href="/dashboard" data-navigo class="block p-2 rounded hover:bg-accent">Dashboard</a>
            <a href="/chart-of-accounts" data-navigo class="block p-2 rounded hover:bg-accent">Chart of Accounts</a>
            <a href="/journal-entry" data-navigo class="block p-2 rounded hover:bg-accent">Journal Entry</a>
          </nav>
        </aside>
        <main id="main-content" class="flex-1 p-6">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;
}

// Render Fallback Loading State
function showLoading() {
  appElement.innerHTML = `
    <div class="flex min-h-screen w-full items-center justify-center">
      <p class="text-sm text-muted-foreground">Memuat...</p>
    </div>
  `;
}

// Inisialisasi Pendaftaran Route
Object.entries(modules).forEach(([file, loader]) => {
  const path = toPath(file);
  const isAuthenticatedRoute = file.includes("/(authenticated)/");

  router.on(path, async () => {
    showLoading();

    try {
      const module = await loader();
      const renderPage = module.default;

      if (isAuthenticatedRoute) {
        // Pasang layout jika belum ada
        if (!document.getElementById("main-content")) {
          appElement.innerHTML = renderLayout();
        }
        const mainContent = document.getElementById(
          "main-content",
        ) as HTMLElement;
        mainContent.innerHTML = "";
        await renderPage(mainContent);
      } else {
        // Halaman publik (misal: login, register) tanpa layout
        appElement.innerHTML = "";
        await renderPage(appElement);
      }
    } catch (error) {
      console.error(`Gagal memuat halaman ${path}:`, error);
      appElement.innerHTML = `
        <div class="p-6 text-destructive">
          <h1 class="text-lg font-bold">Terjadi Kesalahan</h1>
          <p class="text-sm">Gagal memuat konten halaman.</p>
        </div>
      `;
    }
  });
});

// Fallback Route 404 / Redirect ke "/"
router.notFound(() => {
  router.navigate("/");
});

// Jalankan Router saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  router.resolve();
});
