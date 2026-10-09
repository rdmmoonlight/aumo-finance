package com.aumofinance.app.crashlog

// Uncaught exception handler: mencatat stack trace lewat AppLogger lalu
// meneruskan ke handler bawaan Android.
class CrashLogHandler : Thread.UncaughtExceptionHandler {
    private val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()

    override fun uncaughtException(
        thread: Thread,
        throwable: Throwable,
    ) {
        AppLogger.error("CRASH", "Uncaught exception di thread ${thread.name}", throwable)
        defaultHandler?.uncaughtException(thread, throwable)
    }
}
