package com.aumofinance.app.home

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.lifecycleScope
import com.aumofinance.app.coa.CoaActivity
import com.aumofinance.app.dashboard.DashboardActivity
import com.aumofinance.app.data.DbConnectionManager
import com.aumofinance.app.journal.JournalEntryActivity
import com.aumofinance.app.network.ApiClient
import com.aumofinance.app.periods.PeriodsActivity
import com.aumofinance.app.reports.journal.GeneralJournalReportActivity
import com.aumofinance.app.reports.menu.ReportsMenuActivity
import com.aumofinance.app.settings.SettingsActivity
import com.aumofinance.app.ui.theme.AumoTheme
import io.ktor.client.request.get
import kotlinx.coroutines.launch

class HomeActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Modern splash + edge to edge, biar HomeScreen lu yang sebelumnya bisa full bleed
        installSplashScreen()
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        initDatabaseConnection()

        setContent {
            // Paling muthakir: collectAsStateWithLifecycle, bukan collectAsState biasa
            // biar gak leak pas background
            val isDbConnected by DbConnectionManager.isDbConnected.collectAsStateWithLifecycle()

            AumoTheme {
                HomeScreen(
                    dashboard = HomeMenuItem(
                        title = "Dashboard",
                        subtitle = "Ringkasan posisi keuangan periode berjalan",
                        icon = HomeIcons.Dashboard,
                        onClick = { open<DashboardActivity>() }
                    ),
                    journalEntry = HomeMenuItem(
                        title = "Journal Entry",
                        subtitle = "Catat transaksi baru",
                        icon = HomeIcons.JournalEntry,
                        onClick = { open<JournalEntryActivity>() }
                    ),
                    generalJournal = HomeMenuItem(
                        title = "General Journal",
                        subtitle = "Riwayat jurnal umum",
                        icon = HomeIcons.GeneralJournal,
                        onClick = { open<GeneralJournalReportActivity>() }
                    ),
                    periods = HomeMenuItem(
                        title = "Periode",
                        subtitle = "Kelola periode akuntansi",
                        icon = HomeIcons.Periods,
                        onClick = { open<PeriodsActivity>() }
                    ),
                    coa = HomeMenuItem(
                        title = "Chart of Accounts",
                        subtitle = "Daftar & kategori akun",
                        icon = HomeIcons.Coa,
                        onClick = { open<CoaActivity>() }
                    ),
                    reports = HomeMenuItem(
                        title = "Reports",
                        subtitle = "Buku besar, neraca saldo, laporan keuangan",
                        icon = HomeIcons.Reports,
                        onClick = { open<ReportsMenuActivity>() }
                    ),
                    isDbConnected = isDbConnected,
                    onSettingsClick = { open<SettingsActivity>() }
                )
            }
        }
    }

    private fun initDatabaseConnection() {
        // Warmup Render cold-start
        lifecycleScope.launch {
            DbConnectionManager.ensureConnected {
                runCatching { ApiClient.client.get("/api/v1/periods") }
            }
        }

        // Heartbeat di scope DbConnectionManager sendiri, biar tetep jalan walau pindah Activity
        DbConnectionManager.startHeartbeat {
            runCatching { ApiClient.client.get("/api/v1/periods") }
        }
    }

    // Inline reified = paling muthakir, type-safe, gak perlu Class<*>
    private inline fun <reified T : ComponentActivity> open() {
        startActivity(Intent(this, T::class.java))
    }
}
