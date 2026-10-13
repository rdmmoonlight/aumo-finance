export function renderCalculator(): string {
    return `
    <section id="kalkulator" class="max-w-4xl mx-auto px-6 py-16">
      <div class="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl">
        <h2 class="text-2xl font-bold text-white mb-2">Simulasi Efisiensi Pengeluaran</h2>
        <p class="text-slate-400 text-sm mb-6">Hitung potensi penghematan tahunan dengan pencatatan yang terstruktur.</p>

        <div class="space-y-6">
          <div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-slate-300">Pengeluaran Bulanan Saat Ini</span>
              <span id="expense-val" class="font-bold text-indigo-400">Rp 10.000.000</span>
            </div>
            <input id="expense-range" type="range" min="1000000" max="100000000" step="1000000" value="10000000" class="w-full accent-indigo-500" />
          </div>

          <div class="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex justify-between items-center">
            <span class="text-slate-300 text-sm">Estimasi Hemat / Tahun (15%):</span>
            <span id="savings-result" class="text-xl font-bold text-emerald-400">Rp 18.000.000</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function setupCalculatorEvents(): void {
    const range = document.getElementById('expense-range') as HTMLInputElement | null;
    const expenseVal = document.getElementById('expense-val');
    const savingsResult = document.getElementById('savings-result');

    if (range && expenseVal && savingsResult) {
        range.addEventListener('input', (e) => {
            const val = Number((e.target as HTMLInputElement).value);
            expenseVal.textContent = `Rp ${val.toLocaleString('id-ID')}`;
            const savings = val * 0.15 * 12;
            savingsResult.textContent = `Rp ${savings.toLocaleString('id-ID')}`;
        });
    }
}