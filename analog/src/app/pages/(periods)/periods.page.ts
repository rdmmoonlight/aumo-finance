import { RouteMeta } from "@analogjs/router";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  OpenPeriodInfo,
  Period,
  PeriodsService,
} from "../(periods)/periods.service";

export const routeMeta: RouteMeta = {
  title: "Periode Keuangan - Aumo Finance",
};

@Component({
  selector: "app-periods-page",
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-6 p-6">
      <!-- Header Page -->
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Periode Keuangan</h1>
          <p class="text-sm text-slate-600">
            Kelola dan pantau siklus anggaran bulanan Anda.
          </p>
        </div>
        <div class="flex gap-2">
          @if (selectedPeriodId()) {
            <button
              (click)="clearSelection()"
              [disabled]="isLoading()"
              class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset Pilihan
            </button>
          }
          <button
            (click)="openModal.set(true)"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
            Tambah Periode
          </button>
        </div>
      </div>

      <!-- Info Banner Periode Terbuka -->
      @if (openPeriodInfo()?.period) {
        <div
          class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 flex items-center justify-between"
        >
          <div>
            <span
              class="text-xs font-semibold uppercase tracking-wider text-blue-600 block"
              >Periode Berjalan</span
            >
            <span class="text-lg font-bold">{{
              openPeriodInfo()?.period?.name
            }}</span>
          </div>
          <button
            (click)="closePeriod(openPeriodInfo()!.period!.id)"
            [disabled]="isLoading()"
            class="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            Tutup Periode Ini
          </button>
        </div>
      }

      <!-- Table Section -->
      <div
        class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead
              class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              <tr>
                <th scope="col" class="px-6 py-4">Nama Periode</th>
                <th scope="col" class="px-6 py-4">Rentang Waktu</th>
                <th scope="col" class="px-6 py-4">Pemasukan</th>
                <th scope="col" class="px-6 py-4">Pengeluaran</th>
                <th scope="col" class="px-6 py-4">Status</th>
                <th scope="col" class="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @if (isLoading()) {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-slate-500">
                    Memuat data periode...
                  </td>
                </tr>
              } @else {
                @for (period of periods(); track period.id) {
                  <tr
                    class="hover:bg-slate-50/80 transition-colors"
                    [class.bg-brand-50]="selectedPeriodId() === period.id"
                  >
                    <td class="px-6 py-4 font-semibold text-slate-900">
                      {{ period.name }}
                      @if (selectedPeriodId() === period.id) {
                        <span class="ml-2 text-xs text-brand-700 font-normal"
                          >(Terpilih)</span
                        >
                      }
                    </td>
                    <td class="px-6 py-4 text-slate-500">
                      {{ period.startDate }} - {{ period.endDate }}
                    </td>
                    <td class="px-6 py-4 font-medium text-emerald-600">
                      Rp {{ (period.income || 0).toLocaleString("id-ID") }}
                    </td>
                    <td class="px-6 py-4 font-medium text-rose-600">
                      Rp {{ (period.expense || 0).toLocaleString("id-ID") }}
                    </td>
                    <td class="px-6 py-4">
                      @if (
                        period.status === "active" || period.status === "OPEN"
                      ) {
                        <span
                          class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                        >
                          Aktif
                        </span>
                      } @else {
                        <span
                          class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10"
                        >
                          Selesai
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-right space-x-2">
                      <button
                        (click)="selectPeriod(period.id)"
                        [disabled]="selectedPeriodId() === period.id"
                        class="font-medium text-brand-700 hover:text-brand-900 hover:underline disabled:text-slate-400"
                      >
                        Pilih
                      </button>
                      @if (
                        period.status === "active" || period.status === "OPEN"
                      ) {
                        <button
                          (click)="closePeriod(period.id)"
                          class="font-medium text-rose-600 hover:text-rose-800 hover:underline"
                        >
                          Tutup
                        </button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td
                      colspan="6"
                      class="px-6 py-8 text-center text-slate-500"
                    >
                      Belum ada data periode keuangan.
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Form Tambah Periode -->
      @if (openModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        >
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div
              class="flex items-center justify-between border-b border-slate-100 pb-3"
            >
              <h3 class="text-lg font-bold text-slate-900">
                Buat Periode Baru
              </h3>
              <button
                (click)="openModal.set(false)"
                class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <form
              [formGroup]="form"
              (ngSubmit)="submitForm()"
              class="mt-4 space-y-4"
            >
              <div>
                <label
                  for="name"
                  class="mb-1 block text-sm font-medium text-slate-700"
                  >Nama Periode</label
                >
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  placeholder="Contoh: Oktober 2026"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label
                    for="startDate"
                    class="mb-1 block text-sm font-medium text-slate-700"
                    >Tanggal Mulai</label
                  >
                  <input
                    id="startDate"
                    type="date"
                    formControlName="startDate"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label
                    for="endDate"
                    class="mb-1 block text-sm font-medium text-slate-700"
                    >Tanggal Selesai</label
                  >
                  <input
                    id="endDate"
                    type="date"
                    formControlName="endDate"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  (click)="openModal.set(false)"
                  class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  [disabled]="isSubmitting()"
                  class="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
                >
                  {{ isSubmitting() ? "Menyimpan..." : "Simpan Periode" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export default class PeriodsPage implements OnInit {
  private readonly periodsService = inject(PeriodsService);
  private readonly fb = inject(FormBuilder);

  readonly periods = signal<Period[]>([]);
  readonly openPeriodInfo = signal<OpenPeriodInfo | null>(null);
  readonly selectedPeriodId = signal<string | null>(null);

  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly openModal = signal<boolean>(false);

  readonly form = this.fb.group({
    name: ["", Validators.required],
    startDate: ["", Validators.required],
    endDate: ["", Validators.required],
  });

  ngOnInit(): void {
    this.fetchPeriods();
    this.fetchOpenPeriodInfo();
  }

  fetchPeriods(): void {
    this.isLoading.set(true);
    this.periodsService.getPeriods().subscribe({
      next: (res) => {
        this.periods.set(res || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  fetchOpenPeriodInfo(): void {
    this.periodsService.getOpenPeriodInfo().subscribe({
      next: (res) => this.openPeriodInfo.set(res),
    });
  }

  submitForm(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const dto = this.form.getRawValue() as {
      name: string;
      startDate: string;
      endDate: string;
    };

    this.periodsService.createPeriod(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.openModal.set(false);
        this.form.reset();
        this.fetchPeriods();
        this.fetchOpenPeriodInfo();
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  selectPeriod(id: string): void {
    this.periodsService.selectPeriod(id).subscribe({
      next: () => {
        this.selectedPeriodId.set(id);
        this.fetchPeriods();
      },
    });
  }

  clearSelection(): void {
    this.periodsService.clearSelection().subscribe({
      next: () => {
        this.selectedPeriodId.set(null);
        this.fetchPeriods();
      },
    });
  }

  closePeriod(id: string): void {
    if (!confirm("Apakah Anda yakin ingin menutup periode ini?")) return;

    this.periodsService.closePeriod(id).subscribe({
      next: () => {
        this.fetchPeriods();
        this.fetchOpenPeriodInfo();
      },
    });
  }
}
