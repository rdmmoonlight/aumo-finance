src/app/
├── core/
│   ├── components/
│   │   ├── health-tester/             <-- Component Reusable Health Check
│   │   │   └── health-tester.component.ts
│   │   ├── sidebar/
│   │   │   └── sidebar.component.ts
│   │   └── topbar/
│   │       └── topbar.component.ts
│   ├── layouts/
│   │   ├── auth-layout/               <-- Untuk /auth/* (Tanpa Sidebar)
│   │   │   └── auth-layout.component.ts
│   │   └── main-layout/               <-- Untuk (authenticated)
│   │       └── main-layout.component.ts
│   └── services/
│       └── health-checker.service.ts  <-- Service pengetes endpoint
├── pages/
│   ├── ai-assistant/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── chart-of-accounts/
│   ├── dashboard/
│   ├── general-ledgers/
│   │   ├── permanent/
│   │   └── temporary/
│   ├── home/
│   ├── journal-entry/
│   ├── journals/
│   │   ├── adjusting/
│   │   ├── closing/
│   │   └── general/
│   ├── periods/
│   ├── reports/
│   │   └── financial-statements/
│   │       ├── cash-flow/
│   │       ├── financial-position/
│   │       ├── income-statement/
│   │       └── retained-earnings/
│   ├── settings/
│   ├── tools/
│   ├── trial-balances/
│   │   ├── adjusted/
│   │   ├── post-closing/
│   │   └── unadjusted/
│   └── worksheet/
├── app.component.ts
├── app.config.ts
└── app.routes.ts