import { Component } from '@angular/core';
import { HealthTesterComponent } from '../../core/components/health-tester/health-tester.component';

@Component({
    standalone: true,
    imports: [HealthTesterComponent],
    template: `
    <app-health-tester 
      pageTitle="Chart of Accounts" 
      endpoint="/api/v1/accounts">
    </app-health-tester>
  `
})
export class ChartOfAccountsComponent { }