import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink],
    template: `
    <div class="flex h-screen bg-gray-100">
      <!-- SIDEBAR -->
      <aside class="w-64 bg-slate-800 text-white flex flex-col">
        <div class="p-4 text-xl font-bold border-b border-slate-700">Test App</div>
        <nav class="flex-1 p-4 space-y-2">
          <a routerLink="/" class="block px-4 py-2 rounded hover:bg-slate-700">Dashboard / Health</a>
        </nav>
      </aside>

      <!-- MAIN AREA -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- TOPBAR -->
        <header class="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
          <span class="font-medium text-gray-600">Backend Test Dashboard</span>
          <span class="text-sm text-gray-400">Environment: Staging/Dev</span>
        </header>

        <!-- PAGE CONTENT -->
        <main class="flex-1 overflow-y-auto p-4">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AppComponent { }