package com.aumofinance.app.reports.journal

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.journal.JournalApi
import com.aumofinance.app.journal.SimpleApiResponse
import com.aumofinance.app.network.SingleFlight
import com.aumofinance.app.network.safeBody
import io.ktor.client.statement.HttpResponse
import io.ktor.http.isSuccess
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.launch

// State Compose (mutableStateOf), bukan LiveData (lihat
// JournalReportScreen.kt). Satu ViewModel dipakai baik oleh General maupun
// Adjusting Journal — loadGeneral()/loadAdjusting()
// beda endpoint, delete() otomatis reload endpoint yang terakhir dipakai.
class JournalReportViewModel : ViewModel() {
    private val reportApi = JournalReportApi()
    private val journalApi = JournalApi()
    private val flight = SingleFlight()

    var entries: List<JournalReportEntry> by mutableStateOf(emptyList())
        private set
    var selectedPeriodName: String? by mutableStateOf(null)
        private set
    var snackbarMessage: String? by mutableStateOf(null)
        private set

    private var isAdjusting = false

    fun loadGeneral() {
        isAdjusting = false
        fetch { reportApi.getGeneralJournal() }
    }

    fun loadAdjusting() {
        isAdjusting = true
        fetch { reportApi.getAdjustingJournal() }
    }

    // Setelah delete data sudah berubah: replace = true agar request lama yang
    // masih berjalan dibatalkan dan tidak menimpa hasil terbaru.
    private fun reload() {
        if (isAdjusting) {
            fetch(replace = true) { reportApi.getAdjustingJournal() }
        } else {
            fetch(replace = true) { reportApi.getGeneralJournal() }
        }
    }

    private fun fetch(
        replace: Boolean = false,
        call: suspend () -> HttpResponse,
    ) {
        flight.launch(viewModelScope, replace) {
            try {
                val response = call()
                val body = runCatching { response.safeBody<JournalReportResponse>() }.getOrNull()
                // runCatching ikut menelan CancellationException; pastikan pembatalan tetap berlaku.
                ensureActive()
                if (!response.status.isSuccess() || body == null || !body.success) {
                    entries = emptyList()
                    snackbarMessage = body?.message?.takeIf { it.isNotBlank() }
                        ?: "Failed to load journal (${response.status.value})."
                    return@launch
                }
                entries = body.entries.orEmpty()
                selectedPeriodName = body.selectedPeriodName
            } catch (c: CancellationException) {
                throw c
            } catch (t: Throwable) {
                com.aumofinance.app.crashlog.AppLogger.error("JournalReportViewModel", "Error tertangkap", t)
                entries = emptyList()
                snackbarMessage = t.message ?: "Connection failed."
            }
        }
    }

    fun delete(entry: JournalReportEntry) {
        viewModelScope.launch {
            try {
                // Adjusting punya endpoint delete khusus di backend (memfilter
                // JournalType=="Adjusting" sebagai proteksi tambahan); General
                // tetap pakai journal-entry/delete/{id} yang generik.
                val response =
                    if (isAdjusting) {
                        reportApi.deleteAdjustingEntry(entry.id)
                    } else {
                        journalApi.delete(entry.id)
                    }
                val body = response.safeBody<SimpleApiResponse>()
                if (response.status.isSuccess() && body.success) {
                    reload()
                } else {
                    snackbarMessage = body.message.ifBlank { "Failed to delete entry." }
                }
            } catch (t: Throwable) {
                com.aumofinance.app.crashlog.AppLogger.error("JournalReportViewModel", "Error tertangkap", t)
                snackbarMessage = t.message ?: "Connection failed."
            }
        }
    }

    fun clearSnackbar() {
        snackbarMessage = null
    }
}
