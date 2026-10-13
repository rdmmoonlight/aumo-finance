import { RouteMeta } from '@analogjs/router';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { authGuard } from '../core/auth.guard';
import { AuthService } from '../core/auth.service';
import { Icon, IconName } from '../shared/icon';
import { Logo } from '../shared/logo';

export const routeMeta: RouteMeta = { canActivate: [authGuard] };

interface NavItem {
  label: string;
  path?: string;
  icon: IconName;
}

/** Layout area login: sidebar + top bar. Halaman anak ditaruh di folder (app)/ */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo, Icon],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Overlay mobile -->
      @if (open()) {
        <div class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" (click)="open.set(false)"></div>
      }

      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-900 text-brand-100 transition-transform lg:translate-x-0"
        [class.-translate-x-full]="!open()"
      >
        <div class="flex h-16 items-center px-5">
          <app-logo [light]="true" />
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Menu utama">
          @for (item of nav; track item.label) {
            @if (item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-brand-700 text-white"
                (click)="open.set(false)"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-brand-800"
              >
                <app-icon [name]="item.icon" />
                {{ item.label }}
              </a>
            } @else {
              <span class="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-50">
                <app-icon [name]="item.icon" />
                {{ item.label }}
                <span class="ml-auto rounded bg-brand-800 px-1.5 py-0.5 text-[10px] uppercase">Segera</span>
              </span>
            }
          }
        </nav>

        <div class="border-t border-brand-800 p-3">
          <button type="button" (click)="auth.logout()" class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-brand-800">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
            Keluar
          </button>
        </div>
      </aside>

      <!-- Konten -->
      <div class="lg:pl-64">
        <!-- Top bar -->
        <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button type="button" class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" (click)="open.set(true)" aria-label="Buka menu">
            <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <span class="hidden text-sm font-semibold text-slate-700 lg:block">Aumo Finance</span>

          <div class="flex items-center gap-3">
            <div class="text-right leading-tight">
              <p class="text-sm font-semibold text-slate-900">{{ auth.user()?.name }}</p>
              <p class="hidden text-xs text-slate-500 sm:block">{{ auth.user()?.email }}</p>
            </div>
            <span class="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">{{ initial() }}</span>
          </div>
        </header>

        <main class="p-4 sm:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export default class AppShell {
  readonly auth = inject(AuthService);
  readonly open = signal(false);
  readonly initial = computed(() => (this.auth.user()?.name?.trim()[0] ?? '?').toUpperCase());

  readonly nav: NavItem[] = [
    { label: 'Beranda', path: '/home', icon: 'home' },
    { label: 'Periode', icon: 'calendar' },
    { label: 'Bagan Akun', icon: 'list' },
    { label: 'Jurnal Umum', icon: 'book' },
  ];
}
