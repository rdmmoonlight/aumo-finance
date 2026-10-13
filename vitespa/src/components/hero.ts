export function renderHero(): string {
    return `
    <section class="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
      <span class="px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        Platform Keuangan Modern
      </span>
      <h1 class="text-4xl md:text-6xl font-extrabold text-white mt-6 mb-4 tracking-tight">
        Kelola Keuangan Usaha & Pribadi <br class="hidden md:block"/>
        <span class="text-indigo-400">Rasional & Terukur</span>
      </h1>
      <p class="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
        Pantau arus kas, analisis profitabilitas, dan buat keputusan finansial berbasis data tanpa kerumitan spreadsheet.
      </p>
      <div class="flex justify-center gap-4">
        <a href="#kalkulator" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition">
          Coba Kalkulator
        </a>
        <a href="#harga" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-medium transition">
          Lihat Paket
        </a>
      </div>
    </section>
  `;
}