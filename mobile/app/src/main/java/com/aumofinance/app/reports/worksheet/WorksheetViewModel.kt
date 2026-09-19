package com.aumofinance.app.reports.worksheet

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.ktor.client.call.body
import kotlinx.coroutines.launch

class WorksheetViewModel : ViewModel() {
    private val api = WorksheetApi()

    var report: WorksheetReport? by mutableStateOf(null)
        private set

    fun load() {
        viewModelScope.launch {
            report =
                try {
                    api.getWorksheet().body<WorksheetReport>()
                } catch (t: Throwable) {
                    null
                }
        }
    }
}
