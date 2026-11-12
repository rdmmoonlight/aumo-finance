package com.aumofinance.app.reports.financials.cashflow

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.network.SingleFlight
import com.aumofinance.app.network.safeBody
import com.aumofinance.app.reports.financials.CashFlowReport
import com.aumofinance.app.reports.financials.FinancialsApi

class CashFlowViewModel : ViewModel() {
    private val api = FinancialsApi()
    private val flight = SingleFlight()

    var report: CashFlowReport? by mutableStateOf(null)
        private set

    fun load() {
        flight.launch(viewModelScope) {
            report =
                try {
                    api.getCashFlow().safeBody<CashFlowReport>()
                } catch (t: Throwable) {
                    com.aumofinance.app.crashlog.AppLogger.error("CashFlowViewModel", "Error tertangkap", t)
                    null
                }
        }
    }
}
