package com.aumofinance.app.reports.trialbalance.postclosing

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.reports.trialbalances.TrialBalancesApi
import com.aumofinance.app.reports.trialbalances.TrialBalancesReport
import io.ktor.client.call.body
import kotlinx.coroutines.launch

// Neraca Saldo Pasca-Penutupan: type="post-closing". Retained Earnings sudah
// termasuk efek Closing (walau baris Closing itu sendiri tidak pernah
// tersimpan sebagai entri jurnal).
class PostClosingTrialBalancesViewModel : ViewModel() {
    private val api = TrialBalancesApi()

    var report: TrialBalancesReport? by mutableStateOf(null)
        private set

    fun load() {
        viewModelScope.launch {
            report =
                try {
                    api.getTrialBalances("post-closing").body<TrialBalancesReport>()
                } catch (t: Throwable) {
                    com.aumofinance.app.crashlog.AppLogger.error("PostClosingTrialBalancesViewModel", "Error tertangkap", t)
                    null
                }
        }
    }
}
