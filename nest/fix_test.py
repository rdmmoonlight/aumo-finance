import os
import pathlib

PROJECT_PATH = pathlib.Path("E:/Github/aumo-finance/nest")

def write_file(filepath: pathlib.Path, content: str):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"[SUCCESS] Berhasil menulis/memperbarui: {filepath}")

def main():
    print("=== Auto-Fix Binding Rute Auth & Pipeline untuk Vitest ===")
    
    if not PROJECT_PATH.exists():
        print(f"[ERROR] Path project tidak ditemukan: {PROJECT_PATH}")
        return

    # Membuat file router kustom yang menangani rute-rute auth sebelum diteruskan ke Better Auth bawaan
    router_file = PROJECT_PATH / "src" / "routes" / "auth-custom.routes.ts"
    router_code = """
import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller';

const authCustomRouter = new Hono();

// Daftarkan endpoint kustom agar di-resolve sebelum masuk ke handler Better Auth umum (/auth/*)
authCustomRouter.get('/check-email', AuthController.checkEmail);
authCustomRouter.post('/register', AuthController.register);
authCustomRouter.post('/login', AuthController.login);
authCustomRouter.post('/logout', AuthController.logout);
authCustomRouter.get('/me', AuthController.me);
authCustomRouter.post('/change-password', AuthController.changePassword);
authCustomRouter.get('/sessions', AuthController.getSessions);
authCustomRouter.delete('/sessions', AuthController.revokeSessions);
authCustomRouter.delete('/sessions/:id', AuthController.revokeSessionById);

export default authCustomRouter;
"""
    write_file(router_file, router_code)

    print("\n[INFO] Router kustom auth telah dibuat.")
    print("Pastikan di file utama Hono/Nest Anda (misal `src/index.ts` atau `src/app.ts`), rute kustom ini dipasang **sebelum** middleware Better Auth (`/auth/*`) agar tidak tertimpa.")

if __name__ == "__main__":
    main()