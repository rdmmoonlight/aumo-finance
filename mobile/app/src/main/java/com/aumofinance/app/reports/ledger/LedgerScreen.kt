package com.aumofinance.app.reports.ledger

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
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

// Buku Besar per akun. Dipakai bareng oleh halaman Permanent & Temporary.
@Composable
fun LedgerScreen(
    report: LedgerResponse?,
    isLoading: Boolean = false,
    errorMessage: String? = null,
) {
    Scaffold(containerColor = AumoColors.Background) { innerPadding ->
        Column(modifier = Modifier.fillMaxSize().padding(innerPadding).padding(AumoDimens.SpacingLarge)) {
            Text(
                text = headerText(report, isLoading),
                color = AumoColors.TextMuted,
                fontSize = MaterialTheme.typography.labelMedium.fontSize,
            )
            if (report?.isTemporary == true && report.netIncomeBeforeClosing != null) {
                Text(
                    text = "Laba/Rugi Sebelum Penutupan: ${CurrencyFormatter.format(report.netIncomeBeforeClosing)}",
                    color = if (report.netIncomeBeforeClosing >= 0) AumoColors.Good else AumoColors.Bad,
                    fontWeight = FontWeight.Bold,
                    fontSize = MaterialTheme.typography.bodySmall.fontSize,
                    modifier = Modifier.padding(top = AumoDimens.SpacingSmall),
                )
            }
            if (errorMessage != null) {
                Text(
                    text = errorMessage,
                    color = AumoColors.Bad,
                    fontSize = MaterialTheme.typography.bodySmall.fontSize,
                    modifier = Modifier.padding(top = AumoDimens.SpacingSmall),
                )
            }
            val accounts = report?.accounts ?: emptyList()
            if (report != null && report.hasPeriodSelected && accounts.isEmpty() && !isLoading) {
                Text(
                    text = "Belum ada transaksi pada periode ini.",
                    color = AumoColors.TextMuted,
                    fontSize = MaterialTheme.typography.bodySmall.fontSize,
                    modifier = Modifier.padding(top = AumoDimens.SpacingLarge),
                )
            }
            LazyColumn(modifier = Modifier.fillMaxSize().padding(top = AumoDimens.SpacingSmall)) {
                items(accounts, key = { it.accountId }) { account -> LedgerAccountCard(account) }
            }
        }
    }
}

private fun headerText(
    report: LedgerResponse?,
    isLoading: Boolean,
): String =
    when {
        report == null && isLoading -> "Memuat buku besar..."
        report == null -> "Buku besar belum dimuat"
        !report.hasPeriodSelected -> "Belum ada periode dipilih"
        else -> report.selectedPeriodName ?: "Periode terpilih"
    }

@Composable
private fun LedgerAccountCard(account: LedgerAccount) {
    Column(
        modifier =
            Modifier
                .fillMaxWidth()
                .padding(bottom = AumoDimens.SpacingLarge)
                .background(AumoColors.Surface, RoundedCornerShape(8.dp))
                .padding(AumoDimens.SpacingLarge),
    ) {
        Text(
            text = "${account.referenceNumber} - ${account.accountName.orEmpty()}",
            color = AumoColors.TextPrimary,
            fontWeight = FontWeight.Bold,
            fontSize = MaterialTheme.typography.bodyMedium.fontSize,
        )
        Text(
            text = "Saldo Awal: ${CurrencyFormatter.format(account.beginningBalance)}",
            color = AumoColors.TextMuted,
            fontSize = MaterialTheme.typography.labelSmall.fontSize,
            modifier = Modifier.padding(top = AumoDimens.SpacingSmall),
        )
        LedgerHeaderRow()
        (account.lines ?: emptyList()).forEach { line -> LedgerLineRow(line) }
        Text(
            text = "Saldo Akhir: ${CurrencyFormatter.format(account.endingBalance)}",
            color = AumoColors.TextPrimary,
            fontWeight = FontWeight.Bold,
            fontSize = MaterialTheme.typography.bodySmall.fontSize,
            modifier = Modifier.padding(top = AumoDimens.SpacingSmall),
        )
    }
}

// Backend mengirim EntryDate ISO ("2026-09-15T00:00:00" atau dengan pecahan
// detik); cukup 10 karakter pertama (yyyy-MM-dd) lalu diubah ke dd/MM.
private fun formatDate(iso: String): String =
    if (iso.length >= 10 && iso[4] == '-' && iso[7] == '-') {
        "${iso.substring(8, 10)}/${iso.substring(5, 7)}"
    } else {
        iso
    }

private fun amountOrDash(value: Double): String = if (value > 0) CurrencyFormatter.formatBare(value) else "-"

@Composable
private fun LedgerHeaderRow() {
    Row(modifier = Modifier.fillMaxWidth().padding(top = AumoDimens.SpacingSmall)) {
        Text("Tgl", color = AumoColors.TextMuted, fontSize = MaterialTheme.typography.labelSmall.fontSize, modifier = Modifier.weight(0.7f))
        Text("Keterangan", color = AumoColors.TextMuted, fontSize = MaterialTheme.typography.labelSmall.fontSize, modifier = Modifier.weight(2f))
        Text("Debit", color = AumoColors.TextMuted, fontSize = MaterialTheme.typography.labelSmall.fontSize, modifier = Modifier.weight(1.3f))
        Text("Kredit", color = AumoColors.TextMuted, fontSize = MaterialTheme.typography.labelSmall.fontSize, modifier = Modifier.weight(1.3f))
        Text("Saldo", color = AumoColors.TextMuted, fontSize = MaterialTheme.typography.labelSmall.fontSize, modifier = Modifier.weight(1.4f))
    }
}

@Composable
private fun LedgerLineRow(line: LedgerLine) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = AumoDimens.SpacingSmall)) {
        Text(
            text = formatDate(line.entryDate),
            color = AumoColors.TextMuted,
            fontSize = MaterialTheme.typography.labelSmall.fontSize,
            modifier = Modifier.weight(0.7f),
        )
        Text(
            text = line.description?.takeIf { it.isNotBlank() } ?: line.transactionNumber.orEmpty(),
            color = AumoColors.TextPrimary,
            fontSize = MaterialTheme.typography.labelSmall.fontSize,
            modifier = Modifier.weight(2f),
        )
        Text(
            text = amountOrDash(line.debit),
            color = AumoColors.TextPrimary,
            fontSize = MaterialTheme.typography.labelSmall.fontSize,
            modifier = Modifier.weight(1.3f),
        )
        Text(
            text = amountOrDash(line.credit),
            color = AumoColors.TextPrimary,
            fontSize = MaterialTheme.typography.labelSmall.fontSize,
            modifier = Modifier.weight(1.3f),
        )
        Text(
            text = CurrencyFormatter.formatBare(line.runningBalance),
            color = AumoColors.TextMuted,
            fontSize = MaterialTheme.typography.labelSmall.fontSize,
            modifier = Modifier.weight(1.4f),
        )
    }
}
