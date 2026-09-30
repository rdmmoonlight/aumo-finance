package com.aumofinance.app.reports.financials

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.aumofinance.app.core.CurrencyFormatter
import com.aumofinance.app.ui.theme.AumoColors
import com.aumofinance.app.ui.theme.AumoDimens

// Dipakai bersama oleh Income Statement, Retained Earnings, Financial
// Position, Cash Flow, Closing Journal. Satu baris "label (kiri) — nominal (kanan)",
// dengan opsi tebal untuk baris total/subtotal dan indentasi untuk sub-item.

/** Kerangka umum: header nama periode + isi laporan yang bisa di-scroll. */
@Composable
fun FinancialReportScaffold(
    periodName: String?,
    content: @Composable () -> Unit,
) {
    Scaffold(containerColor = AumoColors.Background) { innerPadding ->
        Column(
            modifier =
                Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .verticalScroll(rememberScrollState())
                    .padding(AumoDimens.SpacingLarge),
        ) {
            Text(
                text = periodName ?: "Belum ada periode dipilih",
                color = AumoColors.TextMuted,
                fontSize = MaterialTheme.typography.labelMedium.fontSize,
            )
            content()
        }
    }
}

@Composable
fun ReportRow(
    label: String,
    amount: Double,
    bold: Boolean = false,
    indent: Boolean = false,
) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = AumoDimens.SpacingSmall)) {
        Text(
            text = if (indent) "    $label" else label,
            color = if (bold) AumoColors.TextPrimary else AumoColors.TextMuted,
            fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal,
            fontSize = MaterialTheme.typography.bodySmall.fontSize,
            modifier = Modifier.weight(1f),
        )
        Text(
            text = CurrencyFormatter.format(amount),
            color = AumoColors.TextPrimary,
            fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal,
            fontSize = MaterialTheme.typography.bodySmall.fontSize,
        )
    }
}

@Composable
fun ReportSectionTitle(text: String) {
    Text(
        text = text,
        color = AumoColors.TextPrimary,
        fontWeight = FontWeight.Bold,
        fontSize = MaterialTheme.typography.bodyMedium.fontSize,
        modifier = Modifier.padding(top = AumoDimens.SpacingLarge, bottom = AumoDimens.SpacingSmall),
    )
}

@Composable
fun ReportDivider() {
    Box(
        modifier =
            Modifier
                .fillMaxWidth()
                .padding(top = AumoDimens.SpacingSmall)
                .height(1.dp)
                .background(AumoColors.Border),
    )
}
