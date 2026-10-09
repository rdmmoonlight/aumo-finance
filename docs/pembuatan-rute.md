Proses pembuatan rute (route) baru secara manual di Hono berbasis TypeScript dengan arsitektur berstandar openapi/zod pada dasarnya mengikuti **4 langkah utama** (1 alur lengkap dari DB schema/DTO hingga pendaftaran di router utama):

---

### Flow Pembuatan Rute Manual

```
  [1. Define Schema/DTO]
   └── Buat Zod Schema untuk Request Body / Response Validation
            │
            ▼
  [2. Define Service & Logic]
   └── Buat fungsi bisnis di Service Layer (interaksi DB / Drizzle)
            │
            ▼
  [3. Define Route & Controller]
   └── Buat instance Hono Router / OpenAPIHono, pasang validator, panggil Service
            │
            ▼
  [4. Register Route di Index]
   └── Mount sub-router ke router utama (app.route atau apiV1.route)

```

---

### Langkah Demi Langkah (Worked Example)

Misalkan kita ingin membuat rute baru **`journal`** (Jurnal Umum) dengan endpoint `POST /api/v1/journals`.

#### Langkah 1: Buat Validation Schema (`src/schemas/journal.schema.ts`)

Gunakan **Zod** untuk validasi data yang masuk dari `c.req.valid('json')`.

```typescript
import { z } from 'zod';

export const createJournalSchema = z.object({
  date: z.string().datetime({ message: 'Format tanggal harus ISO string' }),
  description: z.string().min(3, { message: 'Keterangan minimal 3 karakter' }),
  amount: z.number().positive({ message: 'Nominal harus lebih dari 0' }),
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>;

```

---

#### Langkah 2: Buat Service (`src/services/journal.service.ts`)

Buat fungsionalitas logika bisnis dan query database menggunakan Drizzle ORM.

```typescript
import { db } from '../lib/db.js';
import * as schema from '../db/schema.js';
import type { CreateJournalInput } from '../schemas/journal.schema.js';

export class JournalService {
  async createJournal(input: CreateJournalInput, userId: string) {
    // Jalankan logika transaksi atau query ke DB
    const [newJournal] = await db
      .insert(schema.journal) // Menyesuaikan tabel SSOT Anda
      .values({
        id: crypto.randomUUID(),
        description: input.description,
        amount: input.amount,
        userId: userId,
        createdAt: new Date(),
      })
      .returning();

    return newJournal;
  }
}

export const journalService = new JournalService();

```

---

#### Langkah 3: Buat Route Handler (`src/routes/journal.route.ts`)

Gunakan `OpenAPIHono` (atau `Hono`) dan middleware `zValidator` untuk menangani endpoint.

```typescript
import { zValidator } from '@hono/zod-validator';
import { OpenAPIHono } from '@hono/zod-openapi';
import { createJournalSchema } from '../schemas/journal.schema.js';
import { journalService } from '../services/journal.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import type { AppEnv } from '../types/app.types.js';

export const journalRoute = new OpenAPIHono<AppEnv>();

// Protected Route (membutuhkan autentikasi)
journalRoute.use('*', requireAuth());

// POST /api/v1/journals
journalRoute.post(
  '/',
  zValidator('json', createJournalSchema),
  async (c) => {
    const body = c.req.valid('json');
    const user = c.get('user'); // Diambil dari konteks requireAuth

    const result = await journalService.createJournal(body, user.sub);

    return c.json({
      success: true,
      message: 'Jurnal berhasil ditambahkan',
      data: result,
    }, 201);
  }
);

```

---

#### Langkah 4: Daftarkan Route ke Central Router (`src/routes/index.ts`)

Mount `journalRoute` ke instance router `apiV1` agar otomatis dapat diakses oleh aplikasi.

```typescript
import { OpenAPIHono } from '@hono/zod-openapi';
import type { AppEnv } from '../types/app.types.js';

// Import route baru
import { authRoute } from './auth.route.js';
import { journalRoute } from './journal.route.js'; // <--- Import di sini
import { periodsRoute } from './periods.route.js';

const apiV1 = new OpenAPIHono<AppEnv>();

// Register sub-routes
apiV1.route('/auth', authRoute);
apiV1.route('/periods', periodsRoute);
apiV1.route('/journals', journalRoute); // <--- Register endpoint di bawah /api/v1/journals

export function registerRoutes(app: OpenAPIHono<AppEnv>): void {
  app.route('/api/v1', apiV1);
}

```

---

### Ringkasan Aturan Penting

1. **Named Export Matching**: Pastikan variabel schema/middleware yang dibuat diekspor secara eksplisit (`export const ...`) agar saat di-import di route tidak menyebabkan runtime error `ReferenceError: X is not defined`.
2. **Strict SSOT**: Saat mengambil data di Service Layer, selalu rujuk dari `schema.ts` yang sudah membawa entitas tabel resmi.
3. **Penyelarasan Sub-path**:
* Jika didaftarkan sebagai `apiV1.route('/journals', journalRoute)`
* Dan di dalam `journalRoute` menggunakan `.post('/')`
* Maka URL akhirnya adalah `POST /api/v1/journals`.