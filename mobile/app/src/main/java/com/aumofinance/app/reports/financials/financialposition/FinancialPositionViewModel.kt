package com.aumofinance.app.reports.financials.financialposition

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.network.SingleFlight
import com.aumofinance.app.network.safeBody
import com.aumofinance.app.reports.financials.FinancialPositionReport
import com.aumofinance.app.reports.financials.FinancialsApi

class FinancialPositionViewModel : ViewModel() {
    private val api = FinancialsApi()
    private val flight = SingleFlight()

    var report: FinancialPositionReport? by mutableStateOf(null)
        private set

    fun load(isPostClosing: Boolean = false) {
        flight.launch(viewModelScope) {
            report =
                try {
                    api.getFinancialPosition(isPostClosing).safeBody<FinancialPositionReport>()
                } catch (t: Throwable) {
                    com.aumofinance.app.crashlog.AppLogger.error("FinancialPositionViewModel", "Error tertangkap", t)
                    null
                }
        }
    }
}
