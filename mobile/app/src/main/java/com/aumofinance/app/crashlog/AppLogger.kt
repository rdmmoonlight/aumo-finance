package com.aumofinance.app.crashlog

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CancellationException
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.Callable
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.RejectedExecutionException

// Pencatat log terpusat. Semua error (crash, kegagalan HTTP, exception yang
// "ditelan" try/catch) ditulis ke satu berkas agar tampil di halaman Log.
// Sebelumnya hanya crash tak tertangani yang tercatat, sehingga error yang
// sudah ditangkap (mis. update gagal 404) tidak pernah terlihat.
//
// Penulisan berkas dilakukan di satu thread latar (writer), BUKAN di thread
// pemanggil. Sebelumnya setiap info/warn/error menulis berkas secara sinkron —
// bahkan membaca lalu menulis ulang seluruh berkas (hingga 200 KB) saat melewati
// batas — dan sering dipanggil dari blok catch di Main thread, sehingga UI
// tersendat ketika banyak error beruntun (mis. saat server Render cold start).
object AppLogger {
    private const val FILE_NAME = "crash_log.txt"
    private const val MAX_BYTES = 200_000L
    const val EMPTY_MESSAGE = "Belum ada log."

    @Volatile
    private var logFile: File? = null

    // Menjaga akses berkas (writer, fatal, read, clear) dan timeFormat
    // (SimpleDateFormat tidak thread-safe).
    private val lock = Any()
    private val timeFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())

    private val writer: ExecutorService =
        Executors.newSingleThreadExecutor { runnable ->
            Thread(runnable, "AppLogger-writer").apply { isDaemon = true }
        }

    fun init(context: Context) {
        logFile = File(context.applicationContext.filesDir, FILE_NAME)
    }

    fun info(
        tag: String,
        message: String,
    ) {
        Log.i(tag, message)
        enqueue("INFO", tag, message, null)
    }

    fun warn(
        tag: String,
        message: String,
    ) {
        Log.w(tag, message)
        enqueue("WARN", tag, message, null)
    }

    fun error(
        tag: String,
        message: String,
        throwable: Throwable? = null,
    ) {
        // Pembatalan coroutine bukan error.
        if (throwable is CancellationException) return
        Log.e(tag, message, throwable)
        enqueue("ERROR", tag, message, throwable)
    }

    /**
     * Khusus crash tak tertangani (dipanggil CrashLogHandler). Ditulis SINKRON di
     * thread pemanggil karena proses akan segera dimatikan; penulisan lewat antrean
     * latar bisa belum selesai saat proses mati sehingga log crash hilang.
     */
    fun fatal(
        tag: String,
        message: String,
        throwable: Throwable? = null,
    ) {
        Log.e(tag, message, throwable)
        writeNow(System.currentTimeMillis(), "ERROR", tag, message, throwable)
    }

    // read() dan clear() melewati antrean yang sama supaya log yang baru saja
    // dicatat sudah tertulis (dan tidak muncul kembali setelah clear()).
    fun read(): String =
        onWriter {
            synchronized(lock) {
                val file = logFile
                if (file != null && file.exists() && file.length() > 0) file.readText() else EMPTY_MESSAGE
            }
        }

    fun clear() {
        onWriter {
            synchronized(lock) {
                logFile?.let { if (it.exists()) it.writeText("") }
            }
        }
    }

    private fun <T> onWriter(block: () -> T): T =
        try {
            writer.submit(Callable { block() }).get()
        } catch (_: RejectedExecutionException) {
            block()
        }

    private fun enqueue(
        level: String,
        tag: String,
        message: String,
        throwable: Throwable?,
    ) {
        // Waktu dicatat saat kejadian, bukan saat berkas ditulis.
        val timestamp = System.currentTimeMillis()
        try {
            writer.execute { writeNow(timestamp, level, tag, message, throwable) }
        } catch (_: RejectedExecutionException) {
            // Jangan biarkan logging itu sendiri menyebabkan crash tambahan.
        }
    }

    private fun writeNow(
        timestamp: Long,
        level: String,
        tag: String,
        message: String,
        throwable: Throwable?,
    ) {
        try {
            synchronized(lock) {
                val file = logFile ?: return
                val time = timeFormat.format(Date(timestamp))
                val trace = throwable?.let { "\n${it.stackTraceToString()}" }.orEmpty()
                // Batasi ukuran berkas: buang separuh bagian lama bila melewati batas.
                if (file.exists() && file.length() > MAX_BYTES) {
                    val text = file.readText()
                    file.writeText(text.substring(text.length / 2))
                }
                file.appendText("\n[$time] $level/$tag: $message$trace\n")
            }
        } catch (_: Exception) {
            // Jangan biarkan logging itu sendiri menyebabkan crash tambahan.
        }
    }
}
