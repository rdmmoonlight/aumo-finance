import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { HealthCheckerService, HealthResponse } from '../../services/health-checker.service';

@Component({
    selector: 'app-health-tester',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <!-- Header Page -->
      <div class="flex justify-between items-center border-b pb-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">{{ pageTitle }}</h1>
          <p class="text-sm text-slate-500 font-mono mt-1">Target Endpoint: <span class="bg-slate-200 px-2 py-0.5 rounded text-slate-800">{{ method }} {{ endpoint }}</span></p>
        </div>
        <button (click)="check()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition">
          Re-test Health
        </button>
      </div>

      <!-- State Loading -->
      <div *ngIf="loading" class="p-8 text-center bg-white rounded-xl shadow-sm border">
        <div class="animate-pulse flex flex-col items-center">
          <div class="h-8 w-8 bg-indigo-400 rounded-full mb-2"></div>
          <p class="text-slate-600">Testing connection to backend...</p>
        </div>
      </div>

      <!-- State Result -->
      <div *ngIf="!loading && result" class="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div class="p-6 border-b flex items-center justify-between" [ngClass]="result.status === 200 ? 'bg-emerald-50/50' : 'bg-rose-50/50'">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 text-sm font-bold rounded-full" [ngClass]="result.status === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
              HTTP {{ result.status }}
            </span>
            <span class="font-medium text-slate-700">{{ result.statusText }}</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">{{ result.responseTimeMs }} ms</span>
        </div>

        <!-- Response Payload Preview -->
        <div class="p-6 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
          <p class="text-slate-400 mb-2">// Response Payload from Backend:</p>
          <pre>{{ result.body | json }}</pre>
        </div>
      </div>
    </div>
  `
})
export class HealthTesterComponent implements OnInit {
    @Input({ required: true }) pageTitle!: string;
    @Input({ required: true }) endpoint!: string;
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