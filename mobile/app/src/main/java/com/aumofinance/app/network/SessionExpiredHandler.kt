package com.aumofinance.app.network

import android.content.Context
import android.content.Intent
import com.aumofinance.app.auth.LoginActivity
import com.aumofinance.app.crashlog.AppLogger
import java.util.concurrent.CancellationException

// Dilempar ApiClient saat server membalas 401 di endpoint yang butuh login.
// Turunan CancellationException SENGAJA: AppLogger.error mengabaikannya
// (bukan bug app, jadi tidak masuk log sebagai ERROR), dan coroutine pemanggil
// berhenti tanpa lanjut memproses body kosong. Tanpa ini, setiap pemanggil
// memanggil body<T>() pada response 401 yang kosong dan gagal dengan
// NoTransformationFoundException yang membingungkan.
class SessionExpiredException : CancellationException("Sesi berakhir. Silakan masuk kembali.")

// Penanganan terpusat untuk 401. Token JWT bisa tidak berlaku lagi (kedaluwarsa,
// kunci server berganti, akun berubah) padahal masih tersimpan di
// SessionManager/SessionStore. Sebelumnya app tidak melakukan apa pun: semua
// layar gagal bersamaan sampai user logout manual. Sekarang sesi dibersihkan
// dan user diarahkan ke Login dengan pesan yang jelas.
object SessionExpiredHandler {
    const val EXTRA_SESSION_EXPIRED = "session_expired"
    const val SESSION_EXPIRED_MESSAGE = "Sesi Anda telah berakhir. Silakan masuk kembali."

    // Satu-satunya endpoint yang boleh membalas 401 tanpa berarti sesi habis
    // (kredensial salah) — ditangani sendiri oleh LoginViewModel.
    private const val LOGIN_PATH = "/api/v1/auth/login"

    private var appContext: Context? = null

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    fun isSessionExpiry(
        status: Int,
        path: String,
    ): Boolean = status == 401 && path != LOGIN_PATH

    fun handle() {
        // Beberapa request paralel bisa menerima 401 bersamaan; hanya yang
        // pertama (saat token masih ada) yang membersihkan sesi dan membuka
        // Login, sisanya tidak melakukan apa pun.
        synchronized(this) {
            if (!SessionManager.isLoggedIn()) return
            SessionManager.clear()
        }
        // Hapus juga sesi terenkripsi, kalau tidak SplashActivity akan
        // memulihkan token yang sama (sudah tidak valid) di peluncuran berikutnya.
        SessionStore.clear()
        AppLogger.info("Session", "Token ditolak server (401), kembali ke Login")

        val context = appContext ?: return
        val intent =
            Intent(context, LoginActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                putExtra(EXTRA_SESSION_EXPIRED, true)
            }
        context.startActivity(intent)
    }
}
