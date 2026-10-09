package com.aumofinance.app.reports.ledger

import com.aumofinance.app.network.ApiClient
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.statement.HttpResponse
import io.ktor.http.isSuccess

// Bentuk respons asli backend (GeneralLedgersController): sudah dikelompokkan per akun.
// Mobile hanya membaca dan menampilkan; tidak ada pemrosesan data maupun penulisan ke DB.
data class LedgerLine(
    val journalEntryId: Int,
    val entryDate: String,
    val transactionNumber: String?,
    val description: String?,
    val debit: Double,
    val credit: Double,
    val runningBalance: Double,
)

data class LedgerAccount(
    val accountId: Int,
    val referenceNumber: Int,
    val accountName: String?,
    val accountType: String?,
    val beginningBalance: Double,
    val endingBalance: Double,
    val lines: List<LedgerLine>?,
)

data class LedgerResponse(
    val success: Boolean,
    val hasPeriodSelected: Boolean,
    val selectedPeriodName: String?,
    val isTemporary: Boolean,
    val netIncomeBeforeClosing: Double?, // hanya dikirim endpoint temporary
    val accounts: List<LedgerAccount>?,
)

// Hasil pemuatan untuk ViewModel.
sealed interface LedgerResult {
    data class Success(val report: LedgerResponse) : LedgerResult

    data class Failure(val message: String) : LedgerResult
}

class LedgerApi(private val client: HttpClient = ApiClient.client) {
    // Route backend memakai bentuk JAMAK: /api/v1/reports/general-ledgers/...
    // Hanya GET. Backend yang mengisi data staging sendiri bila belum ada.
    suspend fun getLedger(isTemporary: Boolean): HttpResponse =
        if (isTemporary) {
            client.get("/api/v1/reports/general-ledgers/temporary")
        } else {
            client.get("/api/v1/reports/general-ledgers/permanent")
        }

    suspend fun load(isTemporary: Boolean): LedgerResult =
        try {
            val response = getLedger(isTemporary)
            val body = runCatching { response.body<LedgerResponse>() }.getOrNull()

            when {
                // 404 + hasPeriodSelected=false: belum ada periode dipilih.
                body != null && response.status.value == 404 && !body.hasPeriodSelected ->
                    LedgerResult.Success(LedgerResponse(true, false, null, isTemporary, null, emptyList()))
                !response.status.isSuccess() || body == null ->
                    LedgerResult.Failure("Gagal memuat buku besar (${response.status.value}).")
                else -> LedgerResult.Success(body)
            }
        } catch (t: Throwable) {
            com.aumofinance.app.crashlog.AppLogger.error("LedgerApi", "Error tertangkap", t)
            LedgerResult.Failure("Tidak dapat terhubung ke server.")
        }
}
