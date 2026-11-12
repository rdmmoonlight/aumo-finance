package com.aumofinance.app.coa

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aumofinance.app.network.SingleFlight
import com.aumofinance.app.network.safeBody
import io.ktor.client.statement.HttpResponse
import io.ktor.http.isSuccess
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

// State Compose (mutableStateOf), bukan LiveData.
class CoaViewModel : ViewModel() {
    private val api = CoaApi()
    private val flight = SingleFlight()

    var accounts: List<Account> by mutableStateOf(emptyList())
        private set

    var errorMessage: String? by mutableStateOf(null)
        private set

    // replace = true: parameter pencarian/kategori bisa berubah di tengah jalan,
    // jadi request lama dibatalkan supaya hasil basi tidak menimpa hasil terbaru.
    fun load(
        search: String? = null,
        category: String? = null,
    ) {
        flight.launch(viewModelScope, replace = true) {
            accounts =
                try {
                    api.list(search, category).safeBody<AccountsResponse>().accounts.orEmpty()
                } catch (c: CancellationException) {
                    throw c
                } catch (t: Throwable) {
                    com.aumofinance.app.crashlog.AppLogger.error("CoaViewModel", "Error tertangkap", t)
                    emptyList()
                }
        }
    }

    fun create(request: AccountRequest) {
        viewModelScope.launch { handleResult(api.create(request)) }
    }

    fun update(
        id: Int,
        request: UpdateAccountRequest,
    ) {
        viewModelScope.launch { handleResult(api.update(id, request)) }
    }

    // Backend MENOLAK delete kalau akun sudah punya baris jurnal (400, dengan
    // pesan yang menyuruh set Inactive lewat Update, bukan auto-nonaktifkan
    // sendiri) — pesan itu diteruskan apa adanya ke errorMessage.
    fun delete(id: Int) {
        viewModelScope.launch { handleResult(api.delete(id)) }
    }

    fun clearError() {
        errorMessage = null
    }

    private suspend fun handleResult(response: HttpResponse) {
        try {
            val body = response.safeBody<SimpleApiResponse>()
            if (response.status.isSuccess() && body.success) {
                load()
            } else {
                errorMessage = body.message.ifBlank { "Gagal memproses permintaan (${response.status.value})" }
            }
        } catch (t: Throwable) {
            com.aumofinance.app.crashlog.AppLogger.error("CoaViewModel", "Error tertangkap", t)
            errorMessage = t.message ?: "Koneksi gagal"
        }
    }
}
