package com.aumofinance.app.ui.components

import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

// Menampilkan pesan singkat (sukses/gagal) sebagai Snackbar di dasar layar.
// Dipanggil di dalam Box yang membungkus layar, di atas isi layar.
// [message] non-null memicu Snackbar; [onConsumed] dipanggil setelah Snackbar
// selesai supaya pesan dibersihkan dari state dan tidak muncul ulang saat
// recomposition.
@Composable
fun BoxScope.SnackbarMessageHost(
    message: String?,
    onConsumed: () -> Unit,
    duration: SnackbarDuration = SnackbarDuration.Long,
) {
    val hostState = remember { SnackbarHostState() }

    LaunchedEffect(message) {
        if (message != null) {
            hostState.showSnackbar(message = message, duration = duration)
            onConsumed()
        }
    }

    SnackbarHost(
        hostState = hostState,
        modifier = Modifier.align(Alignment.BottomCenter).navigationBarsPadding(),
    )
}
