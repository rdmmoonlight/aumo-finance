package com.aumofinance.app.reports.ledger.temporary

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.reports.ledger.LedgerApi
import com.aumofinance.app.reports.ledger.LedgerResponse
import com.aumofinance.app.reports.ledger.LedgerResult
import kotlinx.coroutines.launch

// Akun Temporary (Laba Rugi): OperatingIncome, OperatingExpenses, OtherIncome,
// OtherExpenses.
class GeneralLedgerTemporaryViewModel : ViewModel() {
    private val api = LedgerApi()

    var report: LedgerResponse? by mutableStateOf(null)
        private set

    var isLoading: Boolean by mutableStateOf(false)
        private set

    var errorMessage: String? by mutableStateOf(null)
        private set

    fun load() {
        if (isLoading) return
        viewModelScope.launch {
            isLoading = true
            when (val result = api.load(isTemporary = true)) {
                is LedgerResult.Success -> {
                    report = result.report
                    errorMessage = null
                }
                is LedgerResult.Failure -> errorMessage = result.message
            }
            isLoading = false
        }
    }
}
