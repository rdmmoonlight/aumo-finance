package com.aumofinance.app.ui.components

import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import com.aumofinance.app.ui.theme.AumoColors
import java.util.Calendar
import java.util.TimeZone

// Pemilih tanggal Material3. DatePicker Compose bekerja dalam milidetik UTC
// (tengah malam UTC), sedangkan aplikasi memakai Calendar zona lokal —
// konversi dua arah di bawah menjaga tahun/bulan/hari tetap sama.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AumoDatePickerDialog(
    initial: Calendar,
    onDismiss: () -> Unit,
    onConfirm: (Calendar) -> Unit,
) {
    val initialUtcMillis =
        remember(initial) {
            Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply {
                clear()
                set(initial.get(Calendar.YEAR), initial.get(Calendar.MONTH), initial.get(Calendar.DAY_OF_MONTH))
            }.timeInMillis
        }
    val state = rememberDatePickerState(initialSelectedDateMillis = initialUtcMillis)

    DatePickerDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            TextButton(
                onClick = {
                    val selected = state.selectedDateMillis
                    if (selected != null) onConfirm(utcMillisToLocalCalendar(selected)) else onDismiss()
                },
            ) {
                Text("OK", color = AumoColors.Primary)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = AumoColors.TextMuted)
            }
        },
    ) {
        DatePicker(state = state)
    }
}

private fun utcMillisToLocalCalendar(utcMillis: Long): Calendar {
    val utc = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply { timeInMillis = utcMillis }
    return Calendar.getInstance().apply {
        set(utc.get(Calendar.YEAR), utc.get(Calendar.MONTH), utc.get(Calendar.DAY_OF_MONTH))
    }
}
