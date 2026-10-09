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
import com.aumofinance.app.ui.components.ConfirmDialog
import com.aumofinance.app.ui.components.SnackbarMessageHost
import com.aumofinance.app.ui.theme.AumoColors
import com.aumofinance.app.ui.theme.AumoTheme

class CrashLogActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            var content by remember { mutableStateOf(AppLogger.read()) }
            var snackbarMessage by remember { mutableStateOf<String?>(null) }
            var showClearConfirm by remember { mutableStateOf(false) }

            AumoTheme {
                Box(modifier = Modifier.fillMaxSize()) {
                    CrashLogScreen(
                        content = content,
                        onCopyClick = {
                            snackbarMessage =
                                if (content != AppLogger.EMPTY_MESSAGE) {
                                    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    clipboard.setPrimaryClip(ClipData.newPlainText("Log", content))
                                    "Log berhasil disalin!"
                                } else {
                                    "Tidak ada log untuk disalin."
                                }
                        },
                        onClearClick = {
                            if (content == AppLogger.EMPTY_MESSAGE) {
                                snackbarMessage = "Log sudah kosong."
                            } else {
                                showClearConfirm = true
                            }
                        },
                    )
                    if (showClearConfirm) {
                        ConfirmDialog(
                            title = "Hapus Log",
                            message = "Seluruh log akan dihapus permanen.",
                            confirmText = "Hapus",
                            dismissText = "Batal",
                            confirmColor = AumoColors.Bad,
                            onConfirm = {
                                AppLogger.clear()
                                content = AppLogger.read()
                                showClearConfirm = false
                                snackbarMessage = "Log berhasil dihapus."
                            },
                            onDismiss = { showClearConfirm = false },
                        )
                    }
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
