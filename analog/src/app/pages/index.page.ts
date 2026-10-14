import { RouteMeta } from '@analogjs/router';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { pingGuard } from '../core/ping.guard';
import { Logo } from '../shared/logo';

export const routeMeta: RouteMeta = {
  title: 'Aumo Finance - Aplikasi Akuntansi',
  canActivate: [pingGuard]
};

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Logo],
  template: `
    @if (isWakingUp()) {
      <!-- Tampilan Loading / Spinner saat DB sedang dibangunkan -->
      <div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-700"></div>
        <p class="text-base font-semibold text-slate-800">Membangunkan Server & Database...</p>
        <p class="mt-1 text-sm text-slate-500">Mohon tunggu sebentar, layanan sedang disiapkan.</p>
      </div>
    } @else {
      <!-- Tampilan Landing Page Utama -->
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <app-logo />
          <nav class="flex items-center gap-2">
            <a routerLink="/login" class="btn-outline">Masuk</a>
            <a routerLink="/register" class="btn-primary">Daftar</a>
          </nav>
        </div>
      </header>

      <main>
        <section class="mx-auto max-w-6xl px-4 py-20 text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-700">Aplikasi Akuntansi</p>
          <h1 class="mx-auto max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Catat, kelola, dan laporkan keuangan dengan rapi.
          </h1>
          <p class="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Aumo Finance membantu Anda menyusun jurnal, buku besar, dan laporan keuangan per periode
            secara sederhana dan terstruktur.
          </p>
          <div class="mt-8 flex justify-center gap-3">
            <a routerLink="/register" class="btn-primary">Mulai Sekarang</a>
            <a routerLink="/login" class="btn-outline">Saya Sudah Punya Akun</a>
          </div>
        </section>

        <section class="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-3">
          @for (f of features; track f.title) {
            <article class="rounded-xl border border-slate-200 bg-white p-6">
              <h2 class="text-base font-semibold text-slate-900">{{ f.title }}</h2>
              <p class="mt-2 text-sm leading-relaxed text-slate-600">{{ f.desc }}</p>
            </article>
          }
        </section>
      </main>

      <footer class="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        &copy; {{ year }} Aumo Finance. Seluruh hak dilindungi.
      </footer>
    }
  `,
})
export default class LandingPage implements OnInit {
  private http = inject(HttpClient);

  readonly isWakingUp = signal(true);
  readonly year = new Date().getFullYear();
  readonly features = [
    { title: 'Jurnal & Buku Besar', desc: 'Pencatatan transaksi per akun dengan nomor jurnal otomatis.' },
    { title: 'Manajemen Periode', desc: 'Buka dan tutup periode akuntansi dengan saldo awal yang terkontrol.' },
    { title: 'Bagan Akun (COA)', desc: 'Susun daftar akun sesuai kebutuhan usaha Anda.' },
  ];

  ngOnInit() {
    // Tembak GET / ping ke backend/database
    this.http.get('/').subscribe({
      next: () => this.isWakingUp.set(false),
      error: () => this.isWakingUp.set(false) // Tetap tampilkan landing page meski gagal/timeout
    });
  }
}