export function renderPricing(): string {
  return `
    <section id="harga" class="max-w-7xl mx-auto px-6 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-white mb-3">Pilihan Paket Sesuai Kebutuhan</h2>
        <p class="text-slate-400">Pilih paket yang paling cocok untuk mendukung pertumbuhan keuangan usahamu.</p>
        
        <!-- Toggle Monthly / Yearly -->
        <div class="mt-8 flex items-center justify-center gap-3">
          <span id="label-monthly" class="text-sm font-medium text-white">Bulanan</span>
          <button id="pricing-toggle" class="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors focus:outline-none">
            <span id="toggle-circle" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
          </button>
          <span id="label-yearly" class="text-sm font-medium text-slate-400 flex items-center gap-1.5">
            Tahunan
            <span class="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Hemat 20%</span>
          </span>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Starter Plan -->
        <div class="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-8 flex flex-col justify-between hover:border-slate-600 transition">
          <div>
            <h3 class="text-lg font-bold text-white mb-2">Starter</h3>
            <p class="text-slate-400 text-sm mb-6">Untuk individu atau usaha mikro yang baru memulai.</p>
            <div class="mb-6">
              <span class="price-val text-4xl font-extrabold text-white" data-monthly="0" data-yearly="0">Rp 0</span>
              <span class="text-slate-400 text-sm">/ bulan</span>
            </div>
            <ul class="space-y-3 text-sm text-slate-300 mb-8">
              <li class="flex items-center gap-2">✓ Pencatatan Kas Dasar</li>
              <li class="flex items-center gap-2">✓ Laporan Arus Kas Bulanan</li>
              <li class="flex items-center gap-2">✓ 1 Akun Pengguna</li>
            </ul>
          </div>
          <a href="/register" data-navigo class="w-full text-center bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-xl transition text-sm block">
            Mulai Gratis
          </a>
        </div>

        <!-- Pro Plan (Popular) -->
        <div class="bg-slate-800 border-2 border-indigo-500/80 rounded-2xl p-8 flex flex-col justify-between relative shadow-xl shadow-indigo-500/10">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Paling Populer
          </div>
          <div>
            <h3 class="text-lg font-bold text-white mb-2">Pro</h3>
            <p class="text-slate-400 text-sm mb-6">Cocok untuk UMKM & bisnis berkembang yang butuh analisis tajam.</p>
            <div class="mb-6">
              <span class="price-val text-4xl font-extrabold text-white" data-monthly="99.000" data-yearly="79.000">Rp 99.000</span>
              <span class="text-slate-400 text-sm">/ bulan</span>
            </div>
            <ul class="space-y-3 text-sm text-slate-300 mb-8">
              <li class="flex items-center gap-2">✓ Semua Fitur Starter</li>
              <li class="flex items-center gap-2">✓ Analisis Profit & Loss Otomatis</li>
              <li class="flex items-center gap-2">✓ Export Data ke Excel / PDF</li>
              <li class="flex items-center gap-2">✓ Hingga 5 Akun Pengguna</li>
            </ul>
          </div>
          <a href="/register" data-navigo class="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition text-sm block">
            Pilih Paket Pro
          </a>
        </div>

        <!-- Enterprise Plan -->
        <div class="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-8 flex flex-col justify-between hover:border-slate-600 transition">
          <div>
            <h3 class="text-lg font-bold text-white mb-2">Enterprise</h3>
            <p class="text-slate-400 text-sm mb-6">Untuk perusahaan dengan kebutuhan kustomisasi & tim besar.</p>
            <div class="mb-6">
              <span class="price-val text-4xl font-extrabold text-white" data-monthly="299.000" data-yearly="239.000">Rp 299.000</span>
              <span class="text-slate-400 text-sm">/ bulan</span>
            </div>
            <ul class="space-y-3 text-sm text-slate-300 mb-8">
              <li class="flex items-center gap-2">✓ Semua Fitur Pro</li>
              <li class="flex items-center gap-2">✓ Integrasi API khusus (BRIAPI, dll)</li>
              <li class="flex items-center gap-2">✓ Unlimited Akun Pengguna</li>
              <li class="flex items-center gap-2">✓ Priority Support 24/7</li>
            </ul>
          </div>
          <a href="/register" data-navigo class="w-full text-center bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-xl transition text-sm block">
            Hubungi Sales
          </a>
        </div>
      </div>
    </section>
  `;
}

export function setupPricingEvents(): void {
  const toggleBtn = document.getElementById('pricing-toggle');
  const toggleCircle = document.getElementById('toggle-circle');
  const labelMonthly = document.getElementById('label-monthly');
  const labelYearly = document.getElementById('label-yearly');
  const priceElements = document.querySelectorAll<HTMLElement>('.price-val');

  let isYearly = false;

  if (toggleBtn && toggleCircle && labelMonthly && labelYearly) {
    toggleBtn.addEventListener('click', () => {
      isYearly = !isYearly;

      if (isYearly) {
        toggleCircle.classList.replace('translate-x-1', 'translate-x-6');
        labelMonthly.classList.replace('text-white', 'text-slate-400');
        labelYearly.classList.replace('text-slate-400', 'text-white');
      } else {
        toggleCircle.classList.replace('translate-x-6', 'translate-x-1');
        labelYearly.classList.replace('text-white', 'text-slate-400');
        labelMonthly.classList.replace('text-slate-400', 'text-white');
      }

      priceElements.forEach((el) => {
        const monthly = el.getAttribute('data-monthly');
        const yearly = el.getAttribute('data-yearly');
        if (monthly && yearly) {
          el.textContent = `Rp ${isYearly ? yearly : monthly}`;
        }
      });
    });
  }
}