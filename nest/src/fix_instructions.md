/**
 * PANDUAN PERBAIKAN UTAMA UNTUK LOLOS VITEST:
 * 
 * 1. Endpoint /auth/check-email:
 *    - Harus mengembalikan response format: { success: true, email, available: boolean }
 *    - Validasi email harus mengembalikan status 400 dengan { success: false, message: 'Validasi gagal' } jika format salah.
 * 
 * 2. Endpoint /auth/register:
 *    - Berhasil membuat akun harus mengembalikan status code 201 (bukan 200).
 *    - Jika email sudah terdaftar, kembalikan status 409 dengan { success: false, message: 'Email sudah terdaftar' }.
 *    - Validasi password < 8 karakter / body kosong harus mengembalikan status 400.
 * 
 * 3. Endpoint /auth/login:
 *    - Berhasil login mengembalikan message 'Login berhasil' dan cookie session.
 *    - Jika mobile (clientType === 'mobile' atau isMobileClient === true), sertakan token.
 *    - Kredensial salah mengembalikan status 401 dengan message 'Email atau password salah'.
 *    - Password kosong mengembalikan status 400.
 *    - Error tak terduga mengembalikan status 500 dengan message 'Terjadi kesalahan pada server'.
 * 
 * 4. Middleware Pipeline & Error Handling:
 *    - Rate limit auth harus menggunakan key prefix: 'ratelimit:auth:'
 *    - Body melebihi BODY_LIMIT_BYTES harus mengembalikan status 413 dan message 'Ukuran request terlalu besar'.
 *    - JSON rusak/invalid mengembalikan status 400 dan message 'Format JSON tidak valid'.
 */
