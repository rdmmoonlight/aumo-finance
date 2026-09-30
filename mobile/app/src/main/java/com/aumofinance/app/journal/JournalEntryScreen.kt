package com.aumofinance.app.journal

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import com.aumofinance.app.coa.Account
import com.aumofinance.app.core.CurrencyFormatter
import com.aumofinance.app.ui.icons.TablerIcon
import com.aumofinance.app.ui.icons.TablerIcons
import com.aumofinance.app.ui.theme.AumoColors
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import com.aumofinance.app.ui.theme.AumoDimens

private val DATE_DISPLAY = SimpleDateFormat("dd MMM yyyy", Locale("in", "ID"))

/**
 * Halaman Journal Entry. Susunan kotak Journal Type / Entry Date / Transaction
 * Number sengaja dibuat SATU KOLOM penuh (bukan sejajar horizontal) supaya
 * semua kotak rata kiri konsisten.
 */
@Composable
fun JournalEntryScreen(
    pageTitle: String,
    journalType: String,
    onJournalTypeChange: (String) -> Unit,
    entryDate: Calendar,
    onEntryDateClick: () -> Unit,
    transactionNumber: String,
    isLocked: Boolean,
    isEditable: Boolean,
    lines: List<JournalLineDraft>,
    accounts: List<Account>,
    onAddLine: () -> Unit,
    onRemoveLine: (JournalLineDraft) -> Unit,
    totalDebitText: String,
    totalCreditText: String,
    isBalanced: Boolean,
    isEditingMode: Boolean,
    submitButtonText: String,
    onCancel: () -> Unit,
    onSubmit: () -> Unit,
) {
    Scaffold(containerColor = AumoColors.Background) { innerPadding ->
        Column(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            Text(
                text = pageTitle,
                color = AumoColors.TextPrimary,
                fontWeight = FontWeight.Bold,
                fontSize = MaterialTheme.typography.titleLarge.fontSize,
                modifier = Modifier.padding(AumoDimens.SpacingLarge, AumoDimens.SpacingLarge, AumoDimens.SpacingLarge, 0.dp),
            )

            LazyColumn(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                contentPadding = PaddingValues(AumoDimens.SpacingLarge),
                verticalArrangement = Arrangement.spacedBy(AumoDimens.SpacingLarge),
            ) {
                if (isLocked) {
                    item { LockedPeriodWarning() }
                }

                item {
                    JournalDetailsCard(
                        journalType = journalType,
                        onJournalTypeChange = onJournalTypeChange,
                        entryDate = entryDate,
                        onEntryDateClick = onEntryDateClick,
                        transactionNumber = transactionNumber,
                        isEditable = isEditable,
                    )
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            text = "Transaction Lines",
                            color = AumoColors.TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = MaterialTheme.typography.titleMedium.fontSize,
                        )
                        if (isEditable) {
                            Button(
                                onClick = onAddLine,
                                colors = ButtonDefaults.buttonColors(containerColor = AumoColors.Primary),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.heightIn(min = AumoDimens.ButtonHeight),
                            ) {
                                TablerIcon(TablerIcons.Plus, tint = Color.White, size = 14.dp)
                                Spacer(modifier = Modifier.width(AumoDimens.SpacingSmall))
                                Text("Add Line", color = Color.White, fontSize = MaterialTheme.typography.labelMedium.fontSize)
                            }
                        }
                    }
                }

                items(lines) { line ->
                    JournalLineCard(
                        line = line,
                        accounts = accounts,
                        isEditable = isEditable,
                        canRemove = lines.size > 1,
                        onRemove = { onRemoveLine(line) },
                    )
                }
            }

            BottomActionBar(
                totalDebitText = totalDebitText,
                totalCreditText = totalCreditText,
                isBalanced = isBalanced,
                isEditingMode = isEditingMode,
                submitButtonText = submitButtonText,
                onCancel = onCancel,
                onSubmit = onSubmit,
            )
        }
    }
}

@Composable
private fun LockedPeriodWarning() {
    Row(
        modifier =
            Modifier
                .fillMaxWidth()
                .border(1.dp, AumoColors.Bad, RoundedCornerShape(10.dp))
                .background(AumoColors.Surface, RoundedCornerShape(10.dp))
                .padding(AumoDimens.SpacingLarge, AumoDimens.SpacingSmall),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        TablerIcon(TablerIcons.AlertTriangle, tint = AumoColors.Bad, size = 16.dp)
        Spacer(modifier = Modifier.width(AumoDimens.SpacingSmall))
        Text(
            text = "This entry falls in a closed accounting period and cannot be modified.",
            color = AumoColors.Bad,
            fontWeight = FontWeight.Bold,
            fontSize = MaterialTheme.typography.bodySmall.fontSize,
        )
    }
}

/**
 * Kartu Journal Type + Entry Date + Transaction Number.
 * Ketiganya SATU KOLOM (fillMaxWidth masing-masing) sehingga rata kiri
 * konsisten satu sama lain.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun JournalDetailsCard(
    journalType: String,
    onJournalTypeChange: (String) -> Unit,
    entryDate: Calendar,
    onEntryDateClick: () -> Unit,
    transactionNumber: String,
    isEditable: Boolean,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = AumoColors.Surface),
        border = BorderStroke(1.dp, AumoColors.SurfaceElevated),
        shape = RoundedCornerShape(12.dp),
    ) {
        Column(modifier = Modifier.padding(AumoDimens.SpacingLarge), verticalArrangement = Arrangement.spacedBy(AumoDimens.SpacingLarge)) {
            // --- Journal Type: dropdown, item sekarang selalu terlihat
            // (warna teks & background popup diset eksplisit) ---
            FieldLabel("Journal Type")
            var expanded by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = expanded && isEditable,
                onExpandedChange = { if (isEditable) expanded = it },
                modifier = Modifier.fillMaxWidth(),
            ) {
                OutlinedTextField(
                    value = journalType,
                    onValueChange = {},
                    readOnly = true,
                    enabled = isEditable,
                    trailingIcon = { TablerIcon(TablerIcons.Selector, tint = AumoColors.TextSecondary, size = AumoDimens.IconSmall) },
                    colors = journalFieldColors(),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth().menuAnchor(),
                )
                // DropdownMenu biasa (bukan ExposedDropdownMenuDefaults.DropdownMenu
                // — API itu baru ada di Material3 1.3.0+, project ini masih di 1.2.1
                // lewat compose-bom 2024.05.00).
                DropdownMenu(
                    expanded = expanded && isEditable,
                    onDismissRequest = { expanded = false },
                    modifier = Modifier.background(AumoColors.SurfaceElevated),
                ) {
                    JournalEntryViewModel.JOURNAL_TYPES.forEach { option ->
                        DropdownMenuItem(
                            text = { Text(option, color = AumoColors.TextPrimary) },
                            onClick = {
                                onJournalTypeChange(option)
                                expanded = false
                            },
                        )
                    }
                }
            }

            // --- Entry Date ---
            // OutlinedTextField dengan readOnly=true tetap "menelan" event
            // klik-nya sendiri (buat fokus/kursor) sebelum sampai ke
            // Modifier.clickable di atasnya — sehingga field tidak bisa
            // di-klik. Solusinya: taruh Box transparan tanpa ripple di ATAS
            // field itu untuk menangkap klik-nya.
            FieldLabel("Entry Date")
            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = DATE_DISPLAY.format(entryDate.time),
                    onValueChange = {},
                    readOnly = true,
                    enabled = isEditable,
                    trailingIcon = { TablerIcon(TablerIcons.Calendar, tint = AumoColors.TextSecondary, size = AumoDimens.IconSmall) },
                    colors = journalFieldColors(),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth(),
                )
                if (isEditable) {
                    Box(
                        modifier =
                            Modifier
                                .matchParentSize()
                                .clickable(
                                    interactionSource = remember { MutableInteractionSource() },
                                    indication = null,
                                    onClick = onEntryDateClick,
                                ),
                    )
                }
            }

            // --- Transaction Number: teks polos, tanpa kotak/border ---
            FieldLabel("Transaction Number")
            Text(
                text = transactionNumber.ifBlank { "…" },
                color = AumoColors.TextSecondary,
                fontSize = MaterialTheme.typography.bodyMedium.fontSize,
            )
        }
    }
}

@Composable
private fun FieldLabel(text: String) {
    Text(
        text = text,
        color = AumoColors.TextSecondary,
        fontWeight = FontWeight.Bold,
        fontSize = MaterialTheme.typography.labelSmall.fontSize,
    )
}

@Composable
private fun journalFieldColors() =
    OutlinedTextFieldDefaults.colors(
        focusedContainerColor = AumoColors.Background,
        unfocusedContainerColor = AumoColors.Background,
        disabledContainerColor = AumoColors.Background,
        focusedTextColor = AumoColors.TextPrimary,
        unfocusedTextColor = AumoColors.TextPrimary,
        disabledTextColor = AumoColors.TextSecondary,
        focusedBorderColor = AumoColors.Primary,
        unfocusedBorderColor = AumoColors.SurfaceElevated,
        disabledBorderColor = AumoColors.SurfaceElevated,
    )

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun JournalLineCard(
    line: JournalLineDraft,
    accounts: List<Account>,
    isEditable: Boolean,
    canRemove: Boolean,
    onRemove: () -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = AumoColors.Surface),
        border = BorderStroke(1.dp, AumoColors.SurfaceElevated),
        shape = RoundedCornerShape(12.dp),
    ) {
        Column(modifier = Modifier.padding(AumoDimens.SpacingLarge), verticalArrangement = Arrangement.spacedBy(AumoDimens.SpacingSmall)) {
            // Row 1: Account dropdown & Delete button
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(AumoDimens.SpacingSmall)) {
                var expanded by remember { mutableStateOf(false) }
                val selectedLabel =
                    accounts.firstOrNull { it.id == line.accountId }
                        ?.let { "${it.referenceNumber} - ${it.accountName}" } ?: ""

                ExposedDropdownMenuBox(
                    expanded = expanded && isEditable,
                    onExpandedChange = { if (isEditable) expanded = it },
                    modifier = Modifier.weight(1f),
                ) {
                    OutlinedTextField(
                        value = selectedLabel,
                        onValueChange = {},
                        readOnly = true,
                        enabled = isEditable,
                        placeholder = { Text("Select Account", color = AumoColors.TextSecondary) },
                        trailingIcon = { TablerIcon(TablerIcons.Selector, tint = AumoColors.TextSecondary, size = AumoDimens.IconSmall) },
                        colors = journalFieldColors(),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                    )
                    // Popup di-background eksplisit + teks putih terang —
                    // warna default popup gelap di atas latar gelap sehingga
                    // daftar akun tidak terlihat.
                    DropdownMenu(
                        expanded = expanded && isEditable,
                        onDismissRequest = { expanded = false },
                        modifier = Modifier.background(AumoColors.SurfaceElevated),
                    ) {
                        accounts.forEach { account ->
                            DropdownMenuItem(
                                text = {
                                    Text(
                                        "${account.referenceNumber} - ${account.accountName}",
                                        color = AumoColors.TextPrimary,
                                    )
                                },
                                onClick = {
                                    line.accountId = account.id
                                    expanded = false
                                },
                            )
                        }
                    }
                }

                if (isEditable && canRemove) {
                    Box(
                        modifier =
                            Modifier
                                .background(AumoColors.Bad.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                                .clickable(onClick = onRemove)
                                .padding(AumoDimens.SpacingSmall),
                        contentAlignment = Alignment.Center,
                    ) {
                        TablerIcon(TablerIcons.Trash, tint = AumoColors.Bad, size = 16.dp)
                    }
                }
            }

            // Description
            OutlinedTextField(
                value = line.description,
                onValueChange = { line.description = it },
                enabled = isEditable,
                placeholder = { Text("Description", color = AumoColors.TextSecondary) },
                colors = journalFieldColors(),
                shape = RoundedCornerShape(8.dp),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            // Debit & Credit — dengan pemisah ribuan otomatis
            Row(horizontalArrangement = Arrangement.spacedBy(AumoDimens.SpacingSmall)) {
                ThousandsAmountField(
                    label = "Debit",
                    rawDigits = line.debit,
                    isEditable = isEditable,
                    onValueChange = { line.debit = it },
                    modifier = Modifier.weight(1f),
                )
                ThousandsAmountField(
                    label = "Credit",
                    rawDigits = line.credit,
                    isEditable = isEditable,
                    onValueChange = { line.credit = it },
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}

/**
 * Kotak input Debit/Kredit dengan pemisah ribuan otomatis: user mengetik
 * digit, tampilan langsung diformat "150.000" — nilai yang dikirim ke
 * backend tetap digit mentah tanpa titik (lihat JournalLineDraft).
 */
@Composable
private fun ThousandsAmountField(
    label: String,
    rawDigits: String,
    isEditable: Boolean,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        Text(label, color = AumoColors.TextSecondary, fontSize = MaterialTheme.typography.labelSmall.fontSize)
        Spacer(modifier = Modifier.height(2.dp))
        val formatted = CurrencyFormatter.formatDigitsGrouped(rawDigits)
        OutlinedTextField(
            value = TextFieldValue(text = formatted, selection = androidx.compose.ui.text.TextRange(formatted.length)),
            onValueChange = { new ->
                val digits = new.text.filter { it.isDigit() }
                onValueChange(digits)
            },
            enabled = isEditable,
            placeholder = { Text("0", color = AumoColors.TextSecondary) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            colors = journalFieldColors(),
            shape = RoundedCornerShape(8.dp),
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun BottomActionBar(
    totalDebitText: String,
    totalCreditText: String,
    isBalanced: Boolean,
    isEditingMode: Boolean,
    submitButtonText: String,
    onCancel: () -> Unit,
    onSubmit: () -> Unit,
) {
    Column(
        modifier =
            Modifier
                .fillMaxWidth()
                .background(AumoColors.Surface, RoundedCornerShape(16.dp, 16.dp, 0.dp, 0.dp))
                .border(1.dp, AumoColors.SurfaceElevated, RoundedCornerShape(16.dp, 16.dp, 0.dp, 0.dp))
                .padding(AumoDimens.SpacingLarge),
        verticalArrangement = Arrangement.spacedBy(AumoDimens.SpacingSmall),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Total Debit", color = AumoColors.TextSecondary, fontSize = MaterialTheme.typography.labelSmall.fontSize)
                Text(
                    totalDebitText,
                    color = AumoColors.TextPrimary,
                    fontWeight = FontWeight.Bold,
                    fontSize = MaterialTheme.typography.bodyMedium.fontSize,
                )
            }
            Column(modifier = Modifier.weight(1f)) {
                Text("Total Credit", color = AumoColors.TextSecondary, fontSize = MaterialTheme.typography.labelSmall.fontSize)
                Text(
                    totalCreditText,
                    color = AumoColors.TextPrimary,
                    fontWeight = FontWeight.Bold,
                    fontSize = MaterialTheme.typography.bodyMedium.fontSize,
                )
            }
            Box(
                modifier =
                    Modifier
                        .background(if (isBalanced) AumoColors.Good else AumoColors.Bad, RoundedCornerShape(6.dp))
                        .padding(AumoDimens.SpacingSmall, AumoDimens.SpacingSmall),
            ) {
                Text(
                    text = if (isBalanced) "Balanced" else "Unbalanced",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = MaterialTheme.typography.labelSmall.fontSize,
                )
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(AumoDimens.SpacingSmall)) {
            if (isEditingMode) {
                TextButton(
                    onClick = onCancel,
                    colors =
                        ButtonDefaults.textButtonColors(
                            containerColor = AumoColors.SurfaceElevated,
                            contentColor = AumoColors.TextSecondary,
                        ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.heightIn(min = AumoDimens.ButtonHeight),
                ) {
                    Text("Cancel", fontWeight = FontWeight.Bold)
                }
            }
            Button(
                onClick = onSubmit,
                colors = ButtonDefaults.buttonColors(containerColor = AumoColors.Good),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f).heightIn(min = AumoDimens.ButtonHeight),
            ) {
                Text(submitButtonText, color = Color.White, fontWeight = FontWeight.Bold)
            }
        }
    }
}
