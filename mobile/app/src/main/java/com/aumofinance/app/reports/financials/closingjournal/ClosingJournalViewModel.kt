package com.aumofinance.app.reports.financials.closingjournal

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.network.SingleFlight
import com.aumofinance.app.network.safeBody
import com.aumofinance.app.reports.financials.ClosingJournalReport
import com.aumofinance.app.reports.financials.FinancialsApi

class ClosingJournalViewModel : ViewModel() {
    private val api = FinancialsApi()
    private val flight = SingleFlight()

    var report: ClosingJournalReport? by mutableStateOf(null)
        private set

    fun load() {
        flight.launch(viewModelScope) {
            report =
                try {
                    api.getClosingJournal().safeBody<ClosingJournalReport>()
                } catch (t: Throwable) {
                    com.aumofinance.app.crashlog.AppLogger.error("ClosingJournalViewModel", "Error tertangkap", t)
                    null
                }
        }
    }
}
