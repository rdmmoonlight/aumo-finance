package com.aumofinance.app.reports.trialbalances

import com.aumofinance.app.network.ApiClient
import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.statement.HttpResponse

data class TrialBalancesRow(
    // Backend mengirim accountId sebagai Guid (string) dan nomor akun sebagai string.
    val accountId: String,
    val referenceNumber: String,
    val accountName: String,
    val type: String,
    val role: String,
    val normalBalanceIsDebit: Boolean,
    val netBalance: Double,
    val debit: Double,
    val credit: Double,
)

data class TrialBalancesReport(
    val success: Boolean,
    val hasPeriodSelected: Boolean,
    val selectedPeriodName: String?,
    val reportTitle: String,
    val type: String,
    val totalDebit: Double,
    val totalCredit: Double,
    val isBalanced: Boolean,
    val rows: List<TrialBalancesRow>,
)

class TrialBalancesApi(private val client: HttpClient = ApiClient.client) {
    // type: "unadjusted" (hanya General), "adjusted" (General+Adjusting),
    // atau "post-closing" (Retained Earnings sudah termasuk efek Closing,
    // walau baris Closing itu sendiri tidak pernah tersimpan sebagai entri).
    suspend fun getTrialBalances(type: String): HttpResponse =
        client.get("/api/v1/reports/trial-balances") {
            parameter("type", type)
        }
}
