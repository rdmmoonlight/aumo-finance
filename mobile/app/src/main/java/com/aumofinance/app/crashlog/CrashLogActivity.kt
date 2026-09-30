package com.aumofinance.app.crashlog

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.SnackbarDuration
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.aumofinance.app.ui.components.SnackbarMessageHost
import com.aumofinance.app.ui.theme.AumoTheme
import java.io.File

class CrashLogActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val logFile = File(filesDir, "crash_log.txt")
        val content = if (logFile.exists()) logFile.readText() else "Belum ada crash log."

        setContent {
            var snackbarMessage by remember { mutableStateOf<String?>(null) }

            AumoTheme {
                Box(modifier = Modifier.fillMaxSize()) {
                    CrashLogScreen(
                        content = content,
                        onCopyClick = {
                            snackbarMessage =
                                if (content.isNotEmpty() && content != "Belum ada crash log.") {
                                    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    clipboard.setPrimaryClip(ClipData.newPlainText("Crash Log", content))
                                    "Crash log berhasil disalin!"
                                } else {
                                    "Tidak ada log untuk disalin."
                                }
                        },
                    )
                    SnackbarMessageHost(
                        message = snackbarMessage,
                        onConsumed = { snackbarMessage = null },
                        duration = SnackbarDuration.Short,
                    )
                }
            }
        }
    }
}
