package com.aumofinance.app.reports.worksheet

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.network.SingleFlight
import com.aumofinance.app.network.safeBody

class WorksheetViewModel : ViewModel() {
    private val api = WorksheetApi()
    private val flight = SingleFlight()

    var report: WorksheetReport? by mutableStateOf(null)
        private set

    fun load() {
        flight.launch(viewModelScope) {
            report =
                try {
                    api.getWorksheet().safeBody<WorksheetReport>()
                } catch (t: Throwable) {
                    com.aumofinance.app.crashlog.AppLogger.error("WorksheetViewModel", "Error tertangkap", t)
                    null
                }
        }
    }
}
