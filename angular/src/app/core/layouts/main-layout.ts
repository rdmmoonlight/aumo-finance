import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="flex h-screen bg-slate-50 font-sans">
      <!-- SIDEBAR -->
      <aside class="w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div class="p-5 border-b border-slate-800 flex items-center gap-2">
          <div class="h-3 w-3 bg-emerald-500 rounded-full animate-ping"></div>
          <span class="font-bold text-white tracking-wide">Accounting API Tester</span>
        </div>
        
        <nav class="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Health</div>
            <a routerLink="/health" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">GET /health</a>
            <a routerLink="/health/status" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">GET /health/health</a>
            <a routerLink="/health/head" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">HEAD /health</a>
          </div>

          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Auth</div>
            <a routerLink="/auth/login" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">POST /auth/login</a>
            <a routerLink="/auth/google" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">POST /auth/google</a>
            <a routerLink="/auth/google-url" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">GET /auth/google/url</a>
            <a routerLink="/auth/me" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">GET /auth/me</a>
            <a routerLink="/auth/logout" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">POST /auth/logout</a>
          </div>

          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Periods</div>
            <a routerLink="/periods" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">GET /periods</a>
            <a routerLink="/periods/open-info" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">GET /periods/open-info</a>
            <a routerLink="/periods/create" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">POST /periods</a>
            <a routerLink="/periods/select" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">POST /periods/select/:id</a>
            <a routerLink="/periods/unselect" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">DELETE /periods/select</a>
            <a routerLink="/periods/close" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">POST /periods/:id/close</a>
          </div>

          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Avatars</div>
            <a routerLink="/avatars" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">GET /avatars/:fileName</a>
          </div>

          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Docs</div>
            <a routerLink="/docs/openapi" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">GET /openapi.json</a>
          </div>

        </nav>
      </aside>

      <!-- MAIN CONTENT AREA -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- TOPBAR -->
        <header class="h-16 bg-white border-b px-6 flex justify-between items-center">
          <div class="text-sm font-medium text-slate-600">
            Environment: <span class="text-indigo-600 font-mono font-bold">Development / Health Checker</span>
          </div>
          <div class="flex items-center gap-3">
            <a routerLink="/auth/login" class="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded text-slate-700 font-medium">Test Login</a>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto bg-slate-50">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent { }