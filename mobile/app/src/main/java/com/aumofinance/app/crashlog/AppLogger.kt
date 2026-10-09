package com.aumofinance.app.crashlog

import android.content.Context
import android.util.Log
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.CancellationException

// Pencatat log terpusat. Semua error (crash, kegagalan HTTP, exception yang
// "ditelan" try/catch) ditulis ke satu berkas agar tampil di halaman Log.
// Sebelumnya hanya crash tak tertangani yang tercatat, sehingga error yang
// sudah ditangkap (mis. update gagal 404) tidak pernah terlihat.
object AppLogger {
    private const val FILE_NAME = "crash_log.txt"
    private const val MAX_BYTES = 200_000L
    const val EMPTY_MESSAGE = "Belum ada log."

    private var logFile: File? = null

    fun init(context: Context) {
        logFile = File(context.applicationContext.filesDir, FILE_NAME)
    }

    fun info(
        tag: String,
        message: String,
    ) {
        Log.i(tag, message)
        write("INFO", tag, message, null)
    }

    fun warn(
        tag: String,
        message: String,
    ) {
        Log.w(tag, message)
        write("WARN", tag, message, null)
    }

    fun error(
        tag: String,
        message: String,
        throwable: Throwable? = null,
    ) {
        // Pembatalan coroutine bukan error.
        if (throwable is CancellationException) return
        Log.e(tag, message, throwable)
        write("ERROR", tag, message, throwable)
    }

    fun read(): String {
        val file = logFile
        return if (file != null && file.exists() && file.length() > 0) file.readText() else EMPTY_MESSAGE
    }

    fun clear() {
        synchronized(this) {
            logFile?.let { if (it.exists()) it.writeText("") }
        }
    }

    @Synchronized
    private fun write(
        level: String,
        tag: String,
        message: String,
        throwable: Throwable?,
    ) {
        try {
            val file = logFile ?: return
            val time = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            val trace = throwable?.let { "\n${it.stackTraceToString()}" }.orEmpty()
            // Batasi ukuran berkas: buang separuh bagian lama bila melewati batas.
            if (file.exists() && file.length() > MAX_BYTES) {
                val text = file.readText()
                file.writeText(text.substring(text.length / 2))
            }
            file.appendText("\n[$time] $level/$tag: $message$trace\n")
        } catch (_: Exception) {
            // Jangan biarkan logging itu sendiri menyebabkan crash tambahan.
        }
    }
}
