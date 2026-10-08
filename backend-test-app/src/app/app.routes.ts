import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { HealthCheckerService } from './core/services/health-checker.service';

interface HealthResponse {
    status: number;
    statusText: string;
    responseTimeMs: number;
    body: unknown;
}

// 1. Generic Page Component (Langsung di-render inline tanpa butuh file per page)
@Component({
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center border-b pb-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">{{ pageTitle }}</h1>
          <p class="text-sm text-slate-500 font-mono mt-1">
            Target Endpoint: <span class="bg-slate-200 px-2 py-0.5 rounded text-slate-800">{{ method }} {{ endpoint }}</span>
          </p>
        </div>
        <button (click)="check()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition">
          Re-test Health
        </button>
      </div>

      <div *ngIf="loading" class="p-8 text-center bg-white rounded-xl shadow-sm border animate-pulse">
        <p class="text-slate-600">Testing connection to backend...</p>
      </div>

      <div *ngIf="!loading && result" class="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div class="p-6 border-b flex items-center justify-between" [ngClass]="result.status === 200 ? 'bg-emerald-50' : 'bg-rose-50'">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 text-sm font-bold rounded-full" [ngClass]="result.status === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
              HTTP {{ result.status }}
            </span>
            <span class="font-medium text-slate-700">{{ result.statusText }}</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">{{ result.responseTimeMs }} ms</span>
        </div>
        <div class="p-6 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
          <p class="text-slate-400 mb-2">// Response Payload from Backend:</p>
          <pre>{{ result.body | json }}</pre>
        </div>
      </div>
    </div>
  `
})
export class GenericHealthPageComponent implements OnInit {
    @Input() pageTitle: string = 'Endpoint Tester';
    @Input() endpoint: string = '/';
    @Input() method: string = 'GET';

    private healthService = inject(HealthCheckerService);
    loading = false;
    result: HealthResponse | null = null;

    ngOnInit() {
        this.check();
    }

    check() {
        this.loading = true;
        this.healthService.testEndpoint(this.endpoint, this.method).subscribe((res) => {
            this.result = res;
            this.loading = false;
        });
    }
}

// Helper untuk generate route secara cepat
function createHealthRoute(title: string, endpoint: string, method: string = 'GET') {
    return {
        component: GenericHealthPageComponent,
        data: { pageTitle: title, endpoint, method }
    };
}

// 2. Definisi App Routes
export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    { path: 'auth/login', ...createHealthRoute('Login Endpoint', '/api/v1/auth/login', 'POST') },
    { path: 'auth/register', ...createHealthRoute('Register Endpoint', '/api/v1/auth/register', 'POST') },

    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'dashboard', ...createHealthRoute('Dashboard Summary', '/api/v1/dashboard/summary') },
            { path: 'home', ...createHealthRoute('Home Overview', '/api/v1/home') },
            { path: 'ai-assistant', ...createHealthRoute('AI Assistant Status', '/api/v1/ai/status') },
            { path: 'chart-of-accounts', ...createHealthRoute('Chart of Accounts', '/api/v1/accounts') },
            { path: 'journal-entry', ...createHealthRoute('Journal Entry Metadata', '/api/v1/journal-entries/meta') },
            { path: 'periods', ...createHealthRoute('Accounting Periods', '/api/v1/accounting-periods') },
            { path: 'worksheet', ...createHealthRoute('Worksheet Data', '/api/v1/worksheet') },
            { path: 'settings', ...createHealthRoute('System Settings', '/api/v1/settings') },
            { path: 'tools', ...createHealthRoute('System Tools', '/api/v1/tools/status') },

            // Reports
            { path: 'reports/financial-statements/income-statement', ...createHealthRoute('Income Statement Report', '/api/v1/reports/income-statement') },
            { path: 'reports/financial-statements/retained-earnings', ...createHealthRoute('Retained Earnings Report', '/api/v1/reports/retained-earnings') },
            { path: 'reports/financial-statements/statement-of-cash-flow', ...createHealthRoute('Statement of Cash Flow', '/api/v1/reports/cash-flow') },
            { path: 'reports/financial-statements/statement-of-financial-position', ...createHealthRoute('Financial Position Report', '/api/v1/reports/financial-position') },

            // Journals
            { path: 'journals/general', ...createHealthRoute('General Journal', '/api/v1/journals/general') },
            { path: 'journals/adjusting', ...createHealthRoute('Adjusting Journal', '/api/v1/journals/adjusting') },
            { path: 'journals/closing', ...createHealthRoute('Closing Journal', '/api/v1/journals/closing') },

            // General Ledgers
            { path: 'general-ledgers/permanent', ...createHealthRoute('Permanent General Ledger', '/api/v1/ledgers/permanent') },
            { path: 'general-ledgers/temporary', ...createHealthRoute('Temporary General Ledger', '/api/v1/ledgers/temporary') },

            // Trial Balances
            { path: 'trial-balances/unadjusted', ...createHealthRoute('Unadjusted Trial Balance', '/api/v1/trial-balance/unadjusted') },
            { path: 'trial-balances/adjusted', ...createHealthRoute('Adjusted Trial Balance', '/api/v1/trial-balance/adjusted') },
            { path: 'trial-balances/post-closing', ...createHealthRoute('Post-Closing Trial Balance', '/api/v1/trial-balance/post-closing') },
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];