Accounting API Health Tester & Endpoint Dashboard

Aplikasi frontend Angular (Standalone Architecture) bare minimum yang dirancang sebagai Backend Health Checker & Endpoint Tester Utility. Aplikasi ini menyediakan antarmuka lengkap dengan Sidebar & Topbar untuk menguji serta memverifikasi respons kesehatan (HTTP 200 OK) dari seluruh endpoint backend akuntansi secara online maupun lokal.

📌 Tempat Penyesuaian Endpoint & URL Backend

Ada 2 file utama tempat kamu bisa menyesuaikan URL Backend dan pemetaan endpoint API:

1. Mengubah Base URL Backend

Buka file src/environments/environment.ts:

export const environment = {
  production: true,
  // Ganti URL ini dengan Base URL Backend kamu (Lokal, Staging, atau Server Online)
  apiUrl: 'http://localhost:8080' 
};


Tips: Jika backend sudah di-deploy ke cloud (misal Railway/Render/VPS), ganti apiUrl di atas dengan domain HTTPS backend-mu (contoh: https://api-accounting.up.railway.app).

2. Menyesuaikan Pemetaan Endpoint per Halaman

Buka file src/app/app.routes.ts:
Di dalam file ini terdapat helper function createHealthRoute('Judul Halaman', '/path/endpoint', 'HTTP_METHOD'). Kamu bisa menambah, mengubah, atau menyesuaikan path API sesuai dengan endpoint backend yang tersedia:

// Format: createHealthRoute('Judul Page', 'Path Endpoint', 'Method HTTP')

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Auth Endpoints
  { path: 'auth/login', ...createHealthRoute('Login Endpoint', '/api/v1/auth/login', 'POST') },
  { path: 'auth/register', ...createHealthRoute('Register Endpoint', '/api/v1/auth/register', 'POST') },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // Core Accounting Endpoints
      { path: 'dashboard', ...createHealthRoute('Dashboard Summary', '/api/v1/dashboard/summary') },
      { path: 'home', ...createHealthRoute('Home Overview', '/api/v1/home') },
      { path: 'ai-assistant', ...createHealthRoute('AI Assistant Status', '/api/v1/ai/status') },
      { path: 'chart-of-accounts', ...createHealthRoute('Chart of Accounts', '/api/v1/accounts') },
      { path: 'journal-entry', ...createHealthRoute('Journal Entry Metadata', '/api/v1/journal-entries/meta') },
      { path: 'periods', ...createHealthRoute('Accounting Periods', '/api/v1/accounting-periods') },
      { path: 'worksheet', ...createHealthRoute('Worksheet Data', '/api/v1/worksheet') },
      { path: 'settings', ...createHealthRoute('System Settings', '/api/v1/settings') },
      { path: 'tools', ...createHealthRoute('System Tools', '/api/v1/tools/status') },

      // Reports Endpoints
      { path: 'reports/financial-statements/income-statement', ...createHealthRoute('Income Statement Report', '/api/v1/reports/income-statement') },
      { path: 'reports/financial-statements/retained-earnings', ...createHealthRoute('Retained Earnings Report', '/api/v1/reports/retained-earnings') },
      { path: 'reports/financial-statements/statement-of-cash-flow', ...createHealthRoute('Statement of Cash Flow', '/api/v1/reports/cash-flow') },
      { path: 'reports/financial-statements/statement-of-financial-position', ...createHealthRoute('Financial Position Report', '/api/v1/reports/financial-position') },

      // Journals Endpoints
      { path: 'journals/general', ...createHealthRoute('General Journal', '/api/v1/journals/general') },
      { path: 'journals/adjusting', ...createHealthRoute('Adjusting Journal', '/api/v1/journals/adjusting') },
      { path: 'journals/closing', ...createHealthRoute('Closing Journal', '/api/v1/journals/closing') },

      // General Ledgers Endpoints
      { path: 'general-ledgers/permanent', ...createHealthRoute('Permanent General Ledger', '/api/v1/ledgers/permanent') },
      { path: 'general-ledgers/temporary', ...createHealthRoute('Temporary General Ledger', '/api/v1/ledgers/temporary') },

      // Trial Balances Endpoints
      { path: 'trial-balances/unadjusted', ...createHealthRoute('Unadjusted Trial Balance', '/api/v1/trial-balance/unadjusted') },
      { path: 'trial-balances/adjusted', ...createHealthRoute('Adjusted Trial Balance', '/api/v1/trial-balance/adjusted') },
      { path: 'trial-balances/post-closing', ...createHealthRoute('Post-Closing Trial Balance', '/api/v1/trial-balance/post-closing') },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];


🚀 Fitur Utama

Live HTTP Status Badge: Menampilkan status HTTP secara real-time (200 OK dengan warna hijau, atau 400/500/0 dengan warna merah).

Latency Counter: Mengukur durasi respon API dalam milidetik (ms).

JSON Payload Inspector: Menampilkan isi body response JSON secara otomatis.

Re-test Trigger: Tombol manual untuk melakukan trigger ulang pengecekan ke backend tanpa perlu me-refresh halaman.

Dynamic Routing & Navigation: Menampilkan seluruh menu navigasi aplikasi akuntansi di Sidebar.

🛠️ Instalasi & Penggunaan Lokal

1. Install Dependencies

pnpm install


2. Jalankan Dev Server Lokal

pnpm start


Aplikasi dapat diakses di http://localhost:3000.

3. Build untuk Production

pnpm run build


Hasil kompilasi static SPA akan dihasilkan di folder dist/angular/browser.

☁️ Deployment ke Vercel

Project ini telah dilengkapi file vercel.json untuk menangani routing SPA (Single Page Application).

Via GitHub / Vercel Dashboard:

Push repository ini ke GitHub.

Import repository di Vercel Dashboard.

Vercel akan otomatis mendeteksi Framework Preset Angular.

Klik Deploy.

Via Vercel CLI (Terminal):

pnpm add -g vercel
vercel login
vercel


⚠️ Catatan Penting CORS & HTTPS:

Pastikan backend kamu sudah memberikan izin CORS untuk domain deployment Vercel.

Karena Vercel menggunakan HTTPS, pastikan URL Backend yang kamu masukkan di src/environments/environment.ts juga sudah menggunakan HTTPS untuk menghindari isu Mixed Content.