package com.aumofinance.app.reports.journal

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.aumofinance.app.journal.JournalEntryActivity
import com.aumofinance.app.ui.components.ConfirmDialog
import com.aumofinance.app.ui.components.SnackbarMessageHost
import com.aumofinance.app.ui.theme.AumoColors
import com.aumofinance.app.ui.theme.AumoTheme

// Host Compose tipis — tampilan ada di JournalReportScreen.kt, state ada di
// JournalReportViewModel.
class GeneralJournalReportActivity : ComponentActivity() {
    private val viewModel: JournalReportViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.loadGeneral()

        setContent {
            var showActions by remember { mutableStateOf(false) }
            var entryPendingDelete by remember { mutableStateOf<JournalReportEntry?>(null) }

            AumoTheme {
                Box(modifier = Modifier.fillMaxSize()) {
                    JournalReportScreen(
                        entries = viewModel.entries,
                        selectedPeriodName = viewModel.selectedPeriodName,
                        defaultPeriodLabel = "No period selected",
                        showToggle = true,
                        showActions = showActions,
                        onToggleShowActions = { showActions = it },
                        onEdit = { entry -> openEdit(entry.id) },
                        onDeleteRequest = { entry -> entryPendingDelete = entry },
                    )
                    SnackbarMessageHost(
                        message = viewModel.snackbarMessage,
                        onConsumed = { viewModel.clearSnackbar() },
                    )
                }

                entryPendingDelete?.let { entry ->
                    ConfirmDialog(
                        title = "Delete Entry?",
                        message = "Entry \"${entry.transactionNumber}\" will be permanently deleted. Continue?",
                        confirmText = "Delete",
                        dismissText = "Cancel",
                        confirmColor = AumoColors.Bad,
                        onConfirm = {
                            viewModel.delete(entry)
                            entryPendingDelete = null
                        },
                        onDismiss = { entryPendingDelete = null },
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.loadGeneral()
    }

    private fun openEdit(entryId: Int) {
        startActivity(
            Intent(this, JournalEntryActivity::class.java).apply {
                putExtra(JournalEntryActivity.EXTRA_ENTRY_ID, entryId)
            },
        )
    }
}
