import { RouteMeta } from "@analogjs/router";
import { HttpClient } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";

import { AuthService } from "../../core/auth.service";
import { API_URL } from "../../core/config";

export const routeMeta: RouteMeta = { title: "Beranda - Aumo Finance" };

interface Period {
  id: number;
  periodName: string;
  isClosed: boolean;
  isSelected: boolean;
}

interface PeriodsResponse {
  success: boolean;
  selectedPeriodId: number | null;
  periods: Period[];
}

@Component({
  selector: "app-home",
  template: `
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
      Selamat datang, {{ auth.user()?.name }}
    </h1>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Ringkasan periode akuntansi Anda.</p>

    <section class="mt-6 grid gap-4 sm:grid-cols-3">
      <article class="rounded-xl border border-slate-200 bg-white p-5 transition-colors dark:border-slate-800 dark:bg-slate-800/60">
        <p class="text-sm text-slate-500 dark:text-slate-400">Periode Terpilih</p>
        <p class="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ selectedName() }}
        </p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 transition-colors dark:border-slate-800 dark:bg-slate-800/60">
        <p class="text-sm text-slate-500 dark:text-slate-400">Total Periode</p>
        <p class="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ periods().length }}
        </p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 transition-colors dark:border-slate-800 dark:bg-slate-800/60">
        <p class="text-sm text-slate-500 dark:text-slate-400">Periode Terbuka</p>
        <p class="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ openCount() }}
        </p>
      </article>
    </section>

    <section class="mt-6 rounded-xl border border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-800/60">
      <h2
        class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100"
      >
        Daftar Periode
      </h2>

      @if (loading()) {
        <p class="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">Memuat data...</p>
      } @else if (error()) {
        <p class="px-5 py-6 text-sm text-red-600 dark:text-red-400">{{ error() }}</p>
      } @else if (periods().length === 0) {
        <p class="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
          Belum ada periode. Buat periode pertama Anda.
        </p>
      } @else {
        <ul class="divide-y divide-slate-100 dark:divide-slate-800">
          @for (p of periods(); track p.id) {
            <li class="flex items-center justify-between px-5 py-3 text-sm">
              <span class="font-medium text-slate-800 dark:text-slate-200">{{ p.periodName }}</span>
              <span class="flex items-center gap-2">
                @if (p.isSelected) {
                  <span
                    class="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/60 dark:text-brand-300"
                    >Dipilih</span
                  >
                }
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  [class]="
                    p.isClosed
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                  "
                >
                  {{ p.isClosed ? "Ditutup" : "Terbuka" }}
                </span>
              </span>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export default class HomePage {
  readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  readonly periods = signal<Period[]>([]);
  readonly selectedId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly openCount = computed(
    () => this.periods().filter((p) => !p.isClosed).length,
  );
  readonly selectedName = computed(
    () =>
      this.periods().find((p) => p.id === this.selectedId())?.periodName ?? "-",
  );

  constructor() {
    this.http.get<PeriodsResponse>(`${API_URL}/periods`).subscribe({
      next: (res) => {
        this.periods.set(res.periods ?? []);
        this.selectedId.set(res.selectedPeriodId ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Data periode gagal dimuat.");
        this.loading.set(false);
      },
    });
  }
}
