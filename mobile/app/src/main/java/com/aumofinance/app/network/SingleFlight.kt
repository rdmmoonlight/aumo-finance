package com.aumofinance.app.network

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

/**
 * Mencegah request kembar untuk pemuatan data yang sama.
 *
 * Activity memanggil load() di onCreate DAN onResume, sehingga tanpa penjaga ini
 * setiap layar mengirim dua request identik bersamaan ke server Render yang kecil.
 *
 * - replace = false: bila pemuatan sebelumnya masih berjalan, panggilan baru diabaikan.
 * - replace = true : pemuatan lama dibatalkan lalu diganti (dipakai setelah data
 *   berubah atau parameter berbeda, supaya hasil basi tidak menimpa hasil baru).
 *
 * Dipakai dari viewModelScope (Main thread), sehingga tidak butuh sinkronisasi tambahan.
 * Blok yang dibatalkan harus melempar ulang CancellationException di dalam catch-nya.
 */
class SingleFlight {
    private var job: Job? = null

    fun launch(
        scope: CoroutineScope,
        replace: Boolean = false,
        block: suspend CoroutineScope.() -> Unit,
    ) {
        val running = job
        if (running?.isActive == true) {
            if (!replace) return
            running.cancel()
        }
        job = scope.launch(block = block)
    }
}
