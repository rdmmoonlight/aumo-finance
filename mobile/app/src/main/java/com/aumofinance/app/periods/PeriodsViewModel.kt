package com.aumofinance.app.periods

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.data.DbConnectionManager
import io.ktor.client.call.body
import io.ktor.http.isSuccess
import kotlinx.coroutines.launch

// State Compose (mutableStateOf), bukan LiveData.
class PeriodsViewModel : ViewModel() {
    private val api = PeriodsApi()

    var periods: List<Period> by mutableStateOf(emptyList())
        private set
    var selectedPeriodId: Int? by mutableStateOf(null)
        private set

    // Non-null berarti dialog "Open New Period" sedang ditampilkan; isinya
    // memberi tahu kondisi mana yang berlaku (belum/sudah pernah ada periode
    // yang ditutup) dan daftar akun yang tersedia untuk kondisi kedua.
    var openPeriodInfo: OpenPeriodInfoResponse? by mutableStateOf(null)
        private set

    // Pesan sukses/gagal terakhir dari backend, ditampilkan sebagai Snackbar lalu
    // dibersihkan lewat clearSnackbar() — supaya kegagalan (mis. "period already
    // exists") terlihat oleh pengguna.
    var snackbarMessage: String? by mutableStateOf(null)
        private set

    fun load() {
        viewModelScope.launch {
            try {
                val body = api.list().body<PeriodsResponse>()
                periods = body.periods
                selectedPeriodId = body.selectedPeriodId
                // Request ke backend TERBUKTI berhasil di sini — berarti server Render
                // sudah bangun. Tandai langsung supaya indikator di Home ikut hijau
                // tanpa harus menunggu ping Home selesai sendiri.
                DbConnectionManager.markConnected()
            } catch (t: Throwable) {
                periods = emptyList()
            }
        }
    }

    // Dipanggil sebelum menampilkan dialog Open New Period, supaya dialog
    // tahu harus menampilkan form "daftar akun baru" atau "lanjutkan akun
    // lama" — sesuai kondisi belum/sudah pernah ada periode yang ditutup.
    fun openNewPeriodDialog() {
        viewModelScope.launch {
            try {
                openPeriodInfo = api.openInfo().body<OpenPeriodInfoResponse>()
            } catch (t: Throwable) {
                snackbarMessage = t.message ?: "Network error."
            }
        }
    }

    fun dismissOpenPeriodDialog() {
        openPeriodInfo = null
    }

    fun open(request: CreatePeriodRequest) {
        viewModelScope.launch {
            try {
                val response = api.open(request)
                val body =
                    try {
                        response.body<SimpleApiResponse>()
                    } catch (parseError: Throwable) {
                        SimpleApiResponse(success = false, message = "Failed to open period (HTTP ${response.status.value}).")
                    }
                snackbarMessage = body.message
                if (body.success) {
                    openPeriodInfo = null
                    load()
                }
            } catch (t: Throwable) {
                snackbarMessage = t.message ?: "Network error."
            }
        }
    }

    // Menandai periode ini sebagai yang sedang di-VIEW (ikon mata di halaman
    // Periods) — semua halaman lain (Dashboard, Journal, Laporan) mengikuti
    // periode mana yang IsSelected=true, bukan menerima periodId sebagai parameter.
    fun select(id: Int) {
        viewModelScope.launch {
            try {
                val response = api.select(id)
                val body = response.body<SimpleApiResponse>()
                if (response.status.isSuccess() && body.success) {
                    load()
                } else {
                    snackbarMessage = body.message.ifBlank { "Failed to switch period (HTTP ${response.status.value})." }
                }
            } catch (t: Throwable) {
                snackbarMessage = t.message ?: "Network error."
            }
        }
    }

    fun close(id: Int) {
        viewModelScope.launch {
            try {
                val response = api.close(id)
                snackbarMessage = response.body<SimpleApiResponse>().message
                load()
            } catch (t: Throwable) {
                snackbarMessage = t.message ?: "Network error."
            }
        }
    }

    fun clearSnackbar() {
        snackbarMessage = null
    }
}
