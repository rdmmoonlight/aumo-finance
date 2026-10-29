Dengan menerapkan AuthStore yang menggunakan { providedIn: 'root' }, masalah global state untuk data otentikasi sudah resmi teratasi.

Artinya:

Satu Sumber Kebenaran (Single Source of Truth): Data user, token, status login, maupun kondisi isLoading tersimpan di satu tempat pusat.

Akses Mudah dari Mana Saja: Komponen seperti Navbar, Sidebar, AuthGuard, maupun halaman dashboard bisa langsung meng-inject AuthStore dan membaca signal-nya tanpa perlu kirim-kirim @Input() / @Output().

Otomatis Sinkron: Begitu proses login() atau logout() dijalankan di store, seluruh UI yang membaca state tersebut di seluruh aplikasi akan otomatis ter-update secara reaktif.