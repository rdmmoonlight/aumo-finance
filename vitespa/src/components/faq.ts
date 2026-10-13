export function renderFAQ(): string {
    const faqs = [
        {
            q: 'Apakah Aumo aman untuk digunakan?',
            a: 'Sangat aman. Kami menggunakan enkripsi standar industri untuk melindungi seluruh transaksi dan data finansial milikmu.'
        },
        {
            q: 'Apakah saya bisa melakukan ekspor data keuangan?',
            a: 'Bisa. Pada paket Pro dan Enterprise, kamu dapat mengekspor laporan keuangan lengkap ke dalam format Excel (.xlsx) atau PDF kapan saja.'
        },
        {
            q: 'Apakah ada biaya tersembunyi?',
            a: 'Tidak ada. Harga yang tertera adalah transparan sesuai dengan paket berlangganan yang kamu pilih.'
        },
        {
            q: 'Bagaimana jika saya ingin melakukan upgrade paket?',
            a: 'Kamu dapat melakukan upgrade atau downgrade paket kapan saja langsung melalui dashboard akun milikmu.'
        }
    ];

    return `
    <section id="faq" class="max-w-3xl mx-auto px-6 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-white mb-3">Pertanyaan Umum (FAQ)</h2>
        <p class="text-slate-400">Temukan jawaban atas pertanyaan yang sering diajukan pengguna.</p>
      </div>

      <div class="space-y-4">
        ${faqs
            .map(
                (faq, i) => `
          <div class="border border-slate-700/60 bg-slate-800/40 rounded-xl overflow-hidden">
            <button class="faq-btn w-full text-left p-5 flex justify-between items-center text-white font-medium focus:outline-none" data-target="faq-ans-${i}">
              <span>${faq.q}</span>
              <span class="faq-icon text-indigo-400 font-bold transition-transform duration-200">+</span>
            </button>
            <div id="faq-ans-${i}" class="hidden px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-slate-700/30 pt-3">
              ${faq.a}
            </div>
          </div>
        `
            )
            .join('')}
      </div>
    </section>
  `;
}

export function setupFAQEvents(): void {
    const faqButtons = document.querySelectorAll<HTMLButtonElement>('.faq-btn');

    faqButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            if (!targetId) return;

            const answerEl = document.getElementById(targetId);
            const iconEl = btn.querySelector('.faq-icon');

            if (answerEl) {
                const isHidden = answerEl.classList.contains('hidden');

                // Opsional: Tutup FAQ lain yang terbuka (Accordion Mode)
                document.querySelectorAll('[id^="faq-ans-"]').forEach((el) => el.classList.add('hidden'));
                document.querySelectorAll('.faq-icon').forEach((el) => (el.textContent = '+'));

                if (isHidden) {
                    answerEl.classList.remove('hidden');
                    if (iconEl) iconEl.textContent = '−';
                }
            }
        });
    });
}