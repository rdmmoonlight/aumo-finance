export function renderNavbar(): string {
  return `
    <nav class="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" data-navigo class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
          <span class="text-xl font-bold text-white">Aumo</span>
        </a>
        <div class="hidden md:flex space-x-8 text-slate-300 text-sm font-medium">
          <a href="#fitur" class="hover:text-indigo-400 transition">Fitur</a>
          <a href="#kalkulator" class="hover:text-indigo-400 transition">Kalkulator</a>
          <a href="#harga" class="hover:text-indigo-400 transition">Harga</a>
          <a href="#faq" class="hover:text-indigo-400 transition">FAQ</a>
        </div>
        
        <!-- Tambahkan href="/register" dan data-navigo -->
        <a href="/register" data-navigo class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition">
          Mulai Gratis
        </a>
      </div>
    </nav>
  `;
}