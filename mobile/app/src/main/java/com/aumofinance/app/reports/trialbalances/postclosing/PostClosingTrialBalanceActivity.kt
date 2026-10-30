package com.aumofinance.app.reports.trialbalance.postclosing

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.aumofinance.app.reports.trialbalances.TrialBalancesScreen
import com.aumofinance.app.ui.theme.AumoTheme

class PostClosingTrialBalancesActivity : ComponentActivity() {
    private val viewModel: PostClosingTrialBalancesViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            AumoTheme {
                TrialBalancesScreen(report = viewModel.report, fallbackTitle = "Neraca Saldo Pasca-Penutupan")
            }
        }

        viewModel.load()
    }

    override fun onResume() {
        super.onResume()
        viewModel.load()
    }
}
