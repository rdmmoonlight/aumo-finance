package com.aumofinance.app.crashlog

// Uncaught exception handler: mencatat stack trace lewat AppLogger (sinkron,
// karena proses segera mati) lalu meneruskan ke handler bawaan Android.
class CrashLogHandler : Thread.UncaughtExceptionHandler {
    private val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()

    override fun uncaughtException(
        thread: Thread,
        throwable: Throwable,
    ) {
        AppLogger.fatal("CRASH", "Uncaught exception di thread ${thread.name}", throwable)
        defaultHandler?.uncaughtException(thread, throwable)
    }
}
