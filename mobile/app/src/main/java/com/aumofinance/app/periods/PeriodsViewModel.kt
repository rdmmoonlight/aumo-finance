package com.aumofinance.app.periods

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.crashlog.AppLogger
import com.aumofinance.app.data.DbConnectionManager
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import io.ktor.client.call.body
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
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

    // Mencegah double-tap pada tombol "Open" yang memicu dua POST sekaligus.
    var isSubmitting: Boolean by mutableStateOf(false)
        private set

    /**
     * Memastikan HttpResponse mengembalikan Content-Type JSON sebelum melakukan deserialization.
     * Jika server mengembalikan HTML (misal: gateway loading Render saat cold-start),
     * method ini melemparkan Exception dengan pesan deskriptif.
     */
    private suspend inline fun <reified T> HttpResponse.safeBody(): T {
        val type = this.contentType()?.withoutParameters()
        if (type != null && type != ContentType.Application.Json) {
            val text = this.bodyAsText()
            val shortText = if (text.length > 150) text.take(150) + "..." else text
            throw IllegalStateException("Server returned non-JSON response (${this.status.value}): $shortText")
        }
        return this.body<T>()
    }

    fun load() {
        viewModelScope.launch {
            try {
                val response = api.list()
                val body = response.safeBody<PeriodsResponse>()
                periods = body.periods
                selectedPeriodId = body.selectedPeriodId
                // Request ke backend TERBUKTI berhasil di sini — berarti server Render
                // sudah bangun. Tandai langsung supaya indikator di Home ikut hijau
                // tanpa harus menunggu ping Home selesai sendiri.
                DbConnectionManager.markConnected()
            } catch (t: Throwable) {
                AppLogger.error("PeriodsViewModel", "Error tertangkap", t)
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
                val response = api.openInfo()
                openPeriodInfo = response.safeBody<OpenPeriodInfoResponse>()
            } catch (t: Throwable) {
                AppLogger.error("PeriodsViewModel", "Error tertangkap", t)
                snackbarMessage = t.message ?: "Network error."
            }
        }
    }

    fun dismissOpenPeriodDialog() {
        openPeriodInfo = null
    }

    fun open(request: CreatePeriodRequest) {
        if (isSubmitting) return
        isSubmitting = true
        viewModelScope.launch {
            try {
                val response = api.open(request)
                val (success, message) = parseOpenResult(response)
                snackbarMessage = message
                if (success) {
                    openPeriodInfo = null
                    load()
                }
            } catch (t: Throwable) {
                AppLogger.error("PeriodsViewModel", "Error tertangkap", t)
                snackbarMessage = t.message ?: "Network error."
            } finally {
                isSubmitting = false
            }
        }
    }

    // Backend membalas dua bentuk: {success,message} (hasil service) atau ProblemDetails
    // FluentValidation {title, errors:{Field:[msg]}} untuk HTTP 400 — keduanya dibaca di sini.
    private suspend fun parseOpenResult(response: HttpResponse): Pair<Boolean, String> {
        val raw = runCatching { response.bodyAsText() }.getOrDefault("")
        val json: JsonObject? = runCatching { JsonParser.parseString(raw).asJsonObject }.getOrNull()
        val ok = response.status.isSuccess() && json?.get("success")?.asBoolean != false
        val message =
            json?.get("message")?.takeIf { !it.isJsonNull }?.asString
                ?: json?.getAsJsonObject("errors")
                    ?.entrySet()
                    ?.firstOrNull()
                    ?.value?.asJsonArray
                    ?.firstOrNull()?.asString
                ?: json?.get("title")?.takeIf { !it.isJsonNull }?.asString
        return ok to (message?.takeIf { it.isNotBlank() }
            ?: if (ok) "Period opened." else "Failed to open period (HTTP ${response.status.value}).")
    }

    // Menandai periode ini sebagai yang sedang di-VIEW (ikon mata di halaman
    // Periods) — semua halaman lain (Dashboard, Journal, Laporan) mengikuti
    // periode mana yang IsSelected=true, bukan menerima periodId sebagai parameter.
    fun select(id: Int) {
        viewModelScope.launch {
            try {
                val response = api.select(id)
                val body = response.safeBody<SimpleApiResponse>()
                if (response.status.isSuccess() && body.success) {
                    load()
                } else {
                    snackbarMessage = body.message.ifBlank { "Failed to switch period (HTTP ${response.status.value})." }
                }
            } catch (t: Throwable) {
                AppLogger.error("PeriodsViewModel", "Error tertangkap", t)
                snackbarMessage = t.message ?: "Network error."
            }
        }
    }

    fun close(id: Int) {
        viewModelScope.launch {
            try {
                val response = api.close(id)
                val body = response.safeBody<SimpleApiResponse>()
                snackbarMessage = body.message
                load()
            } catch (t: Throwable) {
                AppLogger.error("PeriodsViewModel", "Error tertangkap", t)
                snackbarMessage = t.message ?: "Network error."
            }
        }
    }

    fun clearSnackbar() {
        snackbarMessage = null
    }
}
