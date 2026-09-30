package com.aumofinance.app.ui.components

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import com.aumofinance.app.ui.theme.AumoColors

// Dialog konfirmasi dua tombol untuk aksi yang tidak bisa dibatalkan
// (mis. hapus entri, tutup periode).
@Composable
fun ConfirmDialog(
    title: String,
    message: String,
    confirmText: String,
    dismissText: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    confirmColor: Color = AumoColors.Primary,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = AumoColors.Surface,
        title = { Text(title, color = AumoColors.TextPrimary, fontWeight = FontWeight.Bold) },
        text = { Text(message, color = AumoColors.TextSecondary) },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text(confirmText, color = confirmColor)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(dismissText, color = AumoColors.TextMuted)
            }
        },
    )
}
