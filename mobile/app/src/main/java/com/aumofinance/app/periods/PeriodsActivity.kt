package com.aumofinance.app.periods

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
import com.aumofinance.app.ui.components.ConfirmDialog
import com.aumofinance.app.ui.components.SnackbarMessageHost
import com.aumofinance.app.ui.theme.AumoTheme

// Host Compose tipis — tampilan ada di PeriodsScreen.kt (termasuk
// OpenPeriodDialog), state ada di PeriodsViewModel.
class PeriodsActivity : ComponentActivity() {
    private val viewModel: PeriodsViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.load()

        setContent {
            var periodPendingClose by remember { mutableStateOf<Period?>(null) }

            AumoTheme {
                Box(modifier = Modifier.fillMaxSize()) {
                    PeriodsScreen(
                        periods = viewModel.periods,
                        selectedPeriodId = viewModel.selectedPeriodId,
                        onSelect = { period -> viewModel.select(period.id) },
                        onCloseRequest = { period -> periodPendingClose = period },
                        onOpenNewPeriodClick = { viewModel.openNewPeriodDialog() },
                    )
                    SnackbarMessageHost(
                        message = viewModel.snackbarMessage,
                        onConsumed = { viewModel.clearSnackbar() },
                    )
                }

                viewModel.openPeriodInfo?.let { info ->
                    OpenPeriodDialog(
                        info = info,
                        onDismiss = { viewModel.dismissOpenPeriodDialog() },
                        onSubmit = { request -> viewModel.open(request) },
                    )
                }

                periodPendingClose?.let { period ->
                    ConfirmDialog(
                        title = "Close Period?",
                        message = "Period \"${period.periodName}\" will be closed and cannot accept new entries anymore. Continue?",
                        confirmText = "Close",
                        dismissText = "Cancel",
                        onConfirm = {
                            viewModel.close(period.id)
                            periodPendingClose = null
                        },
                        onDismiss = { periodPendingClose = null },
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.load()
    }
}
