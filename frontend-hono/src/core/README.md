# Vanilla Runtime Contract (`src/core`)

Modul ini adalah perkakas dasar pengganti dependensi React untuk runtime Vanilla JS di aplikasi ini.

## Modul Utama

1. **`dom.js`**: Manipulasi DOM, Event Listener dengan Auto-cleanup, dan Responsive Helper.
   - `h(tag, props, ...children)`: HyperScript helper untuk membuat elemen DOM.
   - `mount(target, element, clear = true)`: Menempelkan elemen ke container target.
   - `on(target, event, handler, options)`: Mengikat event listener & mengembalikan fungsi disposer.
   - `createDisposer()`: Manajer koleksi cleanup tasks (mencegah memory leak).
   - `isMobile(breakpoint = 768)`: Utility pengecekan breakpoint layar.

2. **`cn.js`**: Utility penanganan class Tailwind (`clsx` + `tailwind-merge`) & Re-export `cva`.
   - `cn(...inputs)`: Menggabungkan class Tailwind dengan resolusi konflik otomatis.
   - `cva`: Langsung di-import untuk varian komponen UI.

3. **`format.js`**: Sentralisasi pengformatan data.
   - `formatRupiah(amount, options)`: Format angka ke Rupiah (`Rp 1.500.000` atau compact `Rp 1,5 jt`).
   - `formatDate(date, style)`: Format tanggal ke Indonesia (`12 Okt 2026`).
   - `formatNumber(val, decimals)`: Format pemisah ribuan standar.

---

## Konvensi Lifecycle Halaman Vanilla

Setiap rute halaman vanilla wajib mengekspor fungsi mounting yang mengembalikan fungsi cleanup (disposer):

```javascript
import { createDisposer, h, mount, on } from '@/core/dom';

export function renderPage(container) {
  const disposer = createDisposer();

  const button = h('button', { className: 'btn' }, 'Klik Saya');
  
  // Ikat event listener via disposer
  disposer.add(on(button, 'click', () => console.log('Clicked')));

  mount(container, button);

  // Return disposer untuk dipanggil saat unmount/pindah rute
  return () => disposer.clean();
}

---