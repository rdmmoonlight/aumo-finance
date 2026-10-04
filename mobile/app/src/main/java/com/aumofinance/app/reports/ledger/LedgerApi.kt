package com.aumofinance.app.reports.ledger

import com.aumofinance.app.network.ApiClient
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.statement.HttpResponse
import io.ktor.http.isSuccess

// Bentuk respons asli backend (GeneralLedgersController): daftar baris datar,
// BUKAN sudah dikelompokkan per akun. Pengelompokan dilakukan di sisi mobile.
data class LedgerRowDto(
    val id: Int,
    val accountId: Int,
    val accountName: String?,
    val accountReferenceNumber: Int,
    val accountType: String?, // hanya dikirim endpoint temporary
    val journalEntryId: Int,
    val entryDate: String,
    val transactionNumber: String?,
    val lineDescription: String?,
    val debit: Double,
    val credit: Double,
    val runningBalance: Double,
)

data class LedgerRawResponse(
    val success: Boolean,
    val hasPeriodSelected: Boolean,
    val selectedPeriodName: String?,
    val isTemporary: Boolean,
    val netIncomeBeforeClosing: Double?, // hanya dikirim endpoint temporary
    val ledgers: List<LedgerRowDto>?,
)

// Model tampilan: sudah dikelompokkan per akun.
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
    val accountName: String,
    val type: String?,
    val endingBalance: Double,
    val lines: List<LedgerLine>,
)

data class LedgerResponse(
    val hasPeriodSelected: Boolean,
    val selectedPeriodName: String?,
    val isTemporary: Boolean,
    val netIncomeBeforeClosing: Double?,
    val ledgers: List<LedgerAccount>,
)

// Hasil pemuatan untuk ViewModel.
sealed interface LedgerResult {
    data class Success(val report: LedgerResponse) : LedgerResult

    data class Failure(val message: String) : LedgerResult
}

class LedgerApi(private val client: HttpClient = ApiClient.client) {
    // Route backend memakai bentuk JAMAK: /api/v1/reports/general-ledgers/...
    // Data buku besar adalah tabel staging yang hanya diisi ulang lewat
    // POST /refresh (atau saat pilih periode), jadi refresh dipanggil dulu
    // supaya jurnal terbaru ikut tampil.
    suspend fun refresh(): HttpResponse = client.post("/api/v1/reports/general-ledgers/refresh")

    suspend fun getLedger(isTemporary: Boolean): HttpResponse =
        if (isTemporary) {
            client.get("/api/v1/reports/general-ledgers/temporary")
        } else {
            client.get("/api/v1/reports/general-ledgers/permanent")
        }

    suspend fun load(isTemporary: Boolean): LedgerResult =
        try {
            // Hasil refresh sengaja tidak menggagalkan pemuatan: data lama tetap bisa ditampilkan.
            runCatching { refresh() }

            val response = getLedger(isTemporary)
            val raw = runCatching { response.body<LedgerRawResponse>() }.getOrNull()

            when {
                // 404 + hasPeriodSelected=false: belum ada periode dipilih.
                raw != null && response.status.value == 404 && !raw.hasPeriodSelected ->
                    LedgerResult.Success(
                        LedgerResponse(false, null, isTemporary, null, emptyList()),
                    )
                !response.status.isSuccess() || raw == null ->
                    LedgerResult.Failure("Gagal memuat buku besar (${response.status.value}).")
                else -> LedgerResult.Success(raw.toLedgerResponse())
            }
        } catch (t: Throwable) {
            LedgerResult.Failure("Tidak dapat terhubung ke server.")
        }
}

private fun LedgerRawResponse.toLedgerResponse(): LedgerResponse {
    val accounts =
        (ledgers ?: emptyList())
            .groupBy { it.accountId }
            .map { (accountId, rows) ->
                // Urutan sudah dari backend (EntryDate lalu Id); saldo akhir = running balance baris terakhir.
                val first = rows.first()
                LedgerAccount(
                    accountId = accountId,
                    referenceNumber = first.accountReferenceNumber,
                    accountName = first.accountName.orEmpty(),
                    type = first.accountType,
                    endingBalance = rows.last().runningBalance,
                    lines =
                        rows.map {
                            LedgerLine(
                                journalEntryId = it.journalEntryId,
                                entryDate = it.entryDate,
                                transactionNumber = it.transactionNumber,
                                description = it.lineDescription,
                                debit = it.debit,
                                credit = it.credit,
                                runningBalance = it.runningBalance,
                            )
                        },
                )
            }
            .sortedBy { it.referenceNumber }

    return LedgerResponse(
        hasPeriodSelected = hasPeriodSelected,
        selectedPeriodName = selectedPeriodName,
        isTemporary = isTemporary,
        netIncomeBeforeClosing = netIncomeBeforeClosing,
        ledgers = accounts,
    )
}
