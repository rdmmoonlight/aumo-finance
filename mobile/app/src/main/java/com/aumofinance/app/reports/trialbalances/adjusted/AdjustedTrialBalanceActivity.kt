package com.aumofinance.app.reports.trialbalances.adjusted

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.aumofinance.app.reports.trialbalances.TrialBalancesScreen
import com.aumofinance.app.ui.theme.AumoTheme

class AdjustedTrialBalancesActivity : ComponentActivity() {
    private val viewModel: AdjustedTrialBalancesViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            AumoTheme {
                TrialBalancesScreen(report = viewModel.report, fallbackTitle = "Neraca Saldo Disesuaikan")
            }
        }

        viewModel.load()
    }

    override fun onResume() {
        super.onResume()
        viewModel.load()
    }
}
