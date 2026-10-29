Mekanisme kerja **Drizzle ORM** (bersama **Drizzle Kit**) pada dasarnya sangat sederhana dan intuitif. Drizzle menggunakan pendekatan **Code-First Schema & Direct Declaration**, di mana **TypeScript adalah *Single Source of Truth*** (satu-satunya sumber kebenaran data).

Berikut alur dan mekanisme kerjanya dari awal pembuatan schema sampai tahap `push` yang sukses tadi:

---

## 1. Definisi Schema di TypeScript (`src/db/schema/*`)

Kamu mendefinisikan struktur tabel, kolom, tipe data, dan relasinya langsung menggunakan kode TypeScript:

```typescript
// src/db/schema/auth.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  // relasi...
}));

```

* **Mekanisme**: Drizzle membaca kode JavaScript/TypeScript murni ini sebagai objek metadata yang merepresentasikan tabel database.

---

## 2. Pendaftaran Schema di `drizzle.config.ts`

Drizzle Kit (tools CLI untuk migrasi/push) membaca konfigurasi dari `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts', // Memberitahu Drizzle Kit lokasi file schema kamu
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Koneksi ke Neon Postgres
  },
});

```

---

## 3. Proses `drizzle-kit push` (Proses Utama)

Saat kamu menjalankan perintah `pnpm drizzle-kit push`, inilah tahapan yang terjadi di balik layar:

```
[ Kode TS Schema Kamu ] ───┐
                          ├───>  [ Drizzle Kit ] ─── Compare ───> [ SQL DDL ] ───> [ Database (Neon) ]
[ Schema Real di DB ]  ───┘

```

1. **Introspeksi Database (Pull)**
Drizzle Kit menyambung ke database Neon kamu dan membaca struktur tabel yang **saat ini ada** di sana.
2. **Kalkulasi Perbedaan (Diffing)**
Drizzle Kit membandingkan struktur di database asli dengan struktur yang kamu tulis di file TypeScript (`src/db/schema/index.ts`).
3. **Generate SQL On-the-Fly**
Drizzle Kit secara otomatis menyusun perintah SQL DDL (seperti `CREATE TABLE`, `ALTER TABLE`, `SET CACHE`, dll) yang dibutuhkan untuk membuat database fisik menjadi persis sama dengan kode TypeScript milikmu.
4. **Eksekusi Perubahan**
SQL tersebut langsung dijalankan ke database Neon, dan memberikan status `[✓] Changes applied`.

---

## 4. Inisialisasi Instance `db` (`src/index.ts`)

Agar aplikasi backend (Hono) kamu bisa berkomunikasi dan melakukan query ke database, kamu menghubungkan driver HTTP Neon dengan Drizzle:

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

```

---

## 5. Menjalankan Query di Service (`src/services/*`)

Saat Service kamu memanggil `db.select()`, Drizzle menerjemahkan query TypeScript menjadi query SQL native yang *type-safe*:

```typescript
// Query Drizzle TS
const rows = await db.select().from(userTable).where(eq(userTable.id, "123"));

// Diterjemahkan Drizzle menjadi SQL Native:
// SELECT "id", "name" FROM "user" WHERE "id" = '123';

```

---

### Alur Singkat Ringkas

$$\text{Tulis Schema TS} \longrightarrow \text{drizzle-kit push (Sync DB)} \longrightarrow \text{Export instance } \texttt{db} \longrightarrow \text{Query di Service}$$

* **Tanpa File Migrasi Manual**: Dengan `drizzle-kit push`, kamu tidak perlu membuat file migrasi `.sql` terpisah saat masa pengembangan (*development*). Database akan selalu sinkron otomatis dengan kode TypeScript kamu.
* **100% Type-Safe**: Jika kamu mengubah nama kolom di schema, TypeScript akan langsung memberi tahu error jika ada query di `service` yang masih menggunakan nama kolom lama.