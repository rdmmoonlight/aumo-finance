package com.aumofinance.app.reports.trialbalance.unadjusted

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.reports.trialbalances.TrialBalancesApi
import com.aumofinance.app.reports.trialbalances.TrialBalancesReport
import io.ktor.client.call.body
import kotlinx.coroutines.launch

// Neraca Saldo (belum disesuaikan): type="unadjusted", hanya jurnal General.
class TrialBalancesViewModel : ViewModel() {
    private val api = TrialBalancesApi()

    var report: TrialBalancesReport? by mutableStateOf(null)
        private set

    fun load() {
        viewModelScope.launch {
            report =
                try {
                    api.getTrialBalances("unadjusted").body<TrialBalancesReport>()
                } catch (t: Throwable) {
                    com.aumofinance.app.crashlog.AppLogger.error("TrialBalancesViewModel", "Error tertangkap", t)
                    null
                }
        }
    }
}
