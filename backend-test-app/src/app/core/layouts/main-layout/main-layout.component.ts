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
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main</div>
            <a routerLink="/dashboard" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">Dashboard</a>
            <a routerLink="/home" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">Home</a>
            <a routerLink="/ai-assistant" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">AI Assistant</a>
          </div>

          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Core Accounting</div>
            <a routerLink="/chart-of-accounts" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">Chart of Accounts</a>
            <a routerLink="/journal-entry" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">Journal Entry</a>
            <a routerLink="/periods" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">Periods</a>
            <a routerLink="/worksheet" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">Worksheet</a>
          </div>

          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Journals</div>
            <a routerLink="/journals/general" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">General Journal</a>
            <a routerLink="/journals/adjusting" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Adjusting Journal</a>
            <a routerLink="/journals/closing" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Closing Journal</a>
          </div>

          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">General Ledgers</div>
            <a routerLink="/general-ledgers/permanent" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Permanent Ledger</a>
            <a routerLink="/general-ledgers/temporary" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Temporary Ledger</a>
          </div>

          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Trial Balances</div>
            <a routerLink="/trial-balances/unadjusted" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Unadjusted</a>
            <a routerLink="/trial-balances/adjusted" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Adjusted</a>
            <a routerLink="/trial-balances/post-closing" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Post Closing</a>
          </div>

          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Financial Reports</div>
            <a routerLink="/reports/financial-statements/income-statement" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Income Statement</a>
            <a routerLink="/reports/financial-statements/statement-of-financial-position" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Financial Position</a>
            <a routerLink="/reports/financial-statements/statement-of-cash-flow" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Cash Flow</a>
            <a routerLink="/reports/financial-statements/retained-earnings" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition pl-6">Retained Earnings</a>
          </div>

          <div>
            <div class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System</div>
            <a routerLink="/settings" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">Settings</a>
            <a routerLink="/tools" routerLinkActive="bg-indigo-600 text-white" class="block px-3 py-2 rounded-lg hover:bg-slate-800 transition">Tools</a>
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
            <a routerLink="/auth/login" class="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded text-slate-700 font-medium">Test Login Page</a>
            <a routerLink="/auth/register" class="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded text-slate-700 font-medium">Test Register Page</a>
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