src/
├── app.ts           # Factory aplikasi Hono (middleware + routes)
├── index.ts         # Entry point (serve via @hono/node-server + graceful shutdown)
├── middleware/      # Pipeline: request-id -> secure-headers -> cors -> logger -> body-limit -> rate-limit
│   ├── index.ts     # registerMiddleware() + error/404 handler
│   ├── auth.ts      # requireAuth() — pasang per-route/group
│   ├── cors.ts
│   ├── rate-limit.ts
│   ├── logger.ts
│   └── error-handler.ts
├── routes/          # Router Hono per modul (mirip Controller)
│   ├── index.ts     # registerRoutes() + /openapi.json + /docs
│   ├── health.route.ts
│   ├── user.route.ts
│   ├── auth.route.ts
│   └── openapi.ts
├── services/        # Logika bisnis utama (Pure TypeScript, tidak tahu HTTP)
├── lib/             # Klien eksternal / utilitas inti (db, env, logger, auth, http)
└── types/           # Type definitions (app.types.ts = tipe context Hono)
