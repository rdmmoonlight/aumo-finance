import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HealthCheckerService, HealthResponse } from '../services/health-checker';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          {{ autoRun ? 'Re-test Health' : 'Kirim Request' }}
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border p-4 space-y-3">
        <label class="block text-xs font-semibold text-slate-500 uppercase">Bearer Token (opsional)</label>
        <input [(ngModel)]="healthService.token" class="w-full border rounded px-3 py-2 text-xs font-mono" placeholder="JWT untuk endpoint terproteksi" />
        <ng-container *ngIf="hasBody">
          <label class="block text-xs font-semibold text-slate-500 uppercase">Request Body (JSON)</label>
          <textarea [(ngModel)]="bodyText" rows="5" class="w-full border rounded px-3 py-2 text-xs font-mono"></textarea>
        </ng-container>
        <p *ngIf="!autoRun" class="text-xs text-amber-600">Endpoint ini mengubah data, sehingga tidak dijalankan otomatis. Tekan "Kirim Request".</p>
      </div>

      <div *ngIf="loading" class="p-8 text-center bg-white rounded-xl shadow-sm border animate-pulse">
        <p class="text-slate-600">Testing connection to backend...</p>
      </div>

      <div *ngIf="!loading && result" class="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div class="p-6 border-b flex items-center justify-between" [ngClass]="result.ok ? 'bg-emerald-50' : 'bg-rose-50'">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 text-sm font-bold rounded-full" [ngClass]="result.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
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
  pageTitle = 'Endpoint Tester';
  endpoint = '/';
  method = 'GET';
  bodyText = '';
  autoRun = true;
  hasBody = false;

  healthService = inject(HealthCheckerService);
  private route = inject(ActivatedRoute);

  loading = false;
  result: HealthResponse | null = null;

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.pageTitle = data['pageTitle'] || this.pageTitle;
      this.endpoint = data['endpoint'] || this.endpoint;
      this.method = data['method'] || this.method;
      this.bodyText = data['body'] ? JSON.stringify(data['body'], null, 2) : '';
      this.hasBody = !['GET', 'HEAD'].includes(this.method);
      this.autoRun = !this.hasBody;
      this.result = null;
      if (this.autoRun) this.check();
    });
  }

  check() {
    let payload: unknown;
    if (this.hasBody && this.bodyText.trim()) {
      try {
        payload = JSON.parse(this.bodyText);
      } catch {
        this.result = { endpoint: this.endpoint, method: this.method, status: 0, statusText: 'JSON body tidak valid', responseTimeMs: 0, body: null, ok: false };
        return;
      }
    }
    this.loading = true;
    this.healthService.testEndpoint(this.endpoint, this.method, payload).subscribe((res) => {
      this.result = res;
      this.loading = false;
    });
  }
}

export function createHealthRoute(title: string, endpoint: string, method: string = 'GET', body?: unknown) {
  return {
    component: GenericHealthPageComponent,
    data: { pageTitle: title, endpoint, method, body }
  };
}