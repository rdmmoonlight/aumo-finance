package com.aumofinance.app.journal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.aumofinance.app.core.CurrencyFormatter
import com.aumofinance.app.ui.components.AumoDatePickerDialog
import com.aumofinance.app.ui.components.SnackbarMessageHost
import com.aumofinance.app.ui.theme.AumoTheme
import kotlinx.coroutines.delay

class JournalEntryActivity : ComponentActivity() {
    companion object {
        const val EXTRA_ENTRY_ID = "extra_entry_id"

        // Jeda singkat agar Snackbar konfirmasi sempat terbaca sebelum
        // layar ditutup (Snackbar ikut hilang bersama Activity).
        private const val CLOSE_DELAY_MS = 1_200L
    }

    private val viewModel: JournalEntryViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val entryId = intent.getIntExtra(EXTRA_ENTRY_ID, -1).takeIf { it != -1 }
        viewModel.initFor(entryId)

        setContent {
            val errorMessage = viewModel.errorMessage
            val saveResult = viewModel.saveResult
            val updateResult = viewModel.updateResult
            var confirmationMessage by remember { mutableStateOf<String?>(null) }
            var showDatePicker by remember { mutableStateOf(false) }

            // LaunchedEffect agar finish() hanya berjalan SEKALI saat sinyal
            // berubah, bukan berulang di setiap recomposition (mis. tiap
            // ketikan di baris lain me-recompose seluruh layar ini).
            LaunchedEffect(saveResult) {
                if (saveResult != null) {
                    confirmationMessage = "Entry saved"
                    delay(CLOSE_DELAY_MS)
                    finish()
                }
            }
            LaunchedEffect(updateResult) {
                if (updateResult == true) {
                    confirmationMessage = "Entry updated"
                    delay(CLOSE_DELAY_MS)
                    finish()
                }
            }

            val isEditable = !viewModel.isLocked
            val isClosing = saveResult != null || updateResult == true

            AumoTheme {
                Box(modifier = Modifier.fillMaxSize()) {
                    JournalEntryScreen(
                        pageTitle = if (entryId == null) "Journal Entry" else "Edit Journal Entry",
                        journalType = viewModel.journalType,
                        onJournalTypeChange = { viewModel.setJournalType(it) },
                        entryDate = viewModel.entryDate,
                        onEntryDateClick = { showDatePicker = true },
                        transactionNumber = viewModel.transactionNumber,
                        isLocked = viewModel.isLocked,
                        isEditable = isEditable,
                        lines = viewModel.lines,
                        accounts = viewModel.accounts,
                        onAddLine = { viewModel.addLine() },
                        onRemoveLine = { viewModel.removeLine(it) },
                        totalDebitText = CurrencyFormatter.format(viewModel.totalDebit()),
                        totalCreditText = CurrencyFormatter.format(viewModel.totalCredit()),
                        isBalanced = viewModel.isBalanced(),
                        isEditingMode = entryId != null,
                        submitButtonText = if (entryId == null) "Save" else "Update",
                        onCancel = { finish() },
                        // Tolak submit ulang selama layar menunggu ditutup,
                        // supaya ketukan ganda tidak membuat entri duplikat.
                        onSubmit = { if (!isClosing) viewModel.save() },
                    )
                    SnackbarMessageHost(
                        message = confirmationMessage ?: errorMessage,
                        onConsumed = {
                            if (confirmationMessage != null) confirmationMessage = null else viewModel.clearError()
                        },
                    )
                }

                if (showDatePicker) {
                    AumoDatePickerDialog(
                        initial = viewModel.entryDate,
                        onDismiss = { showDatePicker = false },
                        onConfirm = { picked ->
                            viewModel.setEntryDate(picked)
                            showDatePicker = false
                        },
                    )
                }
            }
        }
    }
}
