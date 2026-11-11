package com.aumofinance.app.network

import io.ktor.client.call.body
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Memastikan HttpResponse bertipe JSON sebelum deserialization.
 * Jika server mengembalikan HTML (misal: halaman gateway Render saat cold-start),
 * dilempar IllegalStateException dengan pesan deskriptif, bukan
 * NoTransformationFoundException yang membingungkan.
 *
 * Pembacaan teks error dilakukan di Dispatchers.IO agar tidak membebani Main thread.
 * Deserialisasi Gson oleh Ktor sendiri sudah berjalan di Dispatchers.IO.
 */
suspend inline fun <reified T> HttpResponse.safeBody(): T {
    val type = this.contentType()?.withoutParameters()
    if (type != null && type != ContentType.Application.Json) {
        val text = withContext(Dispatchers.IO) { this@safeBody.bodyAsText() }
        val shortText = if (text.length > 150) text.take(150) + "..." else text
        throw IllegalStateException("Server returned non-JSON response (${this.status.value}): $shortText")
    }
    return this.body<T>()
}
