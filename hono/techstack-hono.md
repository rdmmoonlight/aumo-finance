**Framework & Server**
 * **Framework:** Hono (@hono/node-server)
 * **Routing & Docs:** Modular & Group Routing dengan OpenAPI (@hono/zod-openapi) & Scalar (@scalar/hono-api-reference)
 * **Build & Dev Tooling:** tsup (bundler), tsx (watch/dev runner), TypeScript
**Database & ORM**
 * **Database Driver:** Neon Postgres (@neondatabase/serverless), pg
 * **ORM:** Drizzle ORM (drizzle-orm, drizzle-kit)
**Authentication & Security**
 * **Auth Engine:** Better Auth (better-auth, @better-auth/drizzle-adapter)
 * **Tokens & Hashing:** JWT (jsonwebtoken), Bcrypt (bcrypt), Google Auth (google-auth-library)
**Validation & Schema**
 * **Validation:** Zod (zod, @hono/zod-validator)
**Middleware & Utilities**
 * **Core Middleware:** Request ID, Secure Headers, CORS, Body Limit, Rate Limit
 * **Background Queue & Cache:** BullMQ (bullmq), Redis (ioredis)
 * **Storage:** AWS S3 SDK (@aws-sdk/client-s3)
 * **Logging:** Pino (pino, pino-pretty)
**Testing & Code Quality**
 * **Testing:** Vitest (vitest)
 * **Lint & Format:** ESLint, Prettier
