package com.aumofinance.app.network

import io.ktor.client.HttpClient
import com.aumofinance.app.crashlog.AppLogger
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.HttpSend
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.api.createClientPlugin
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.plugins.plugin
import io.ktor.client.request.url
import io.ktor.http.HttpHeaders
import io.ktor.serialization.gson.gson
import java.util.concurrent.TimeUnit

// Sempat diganti cookie ASP.NET Identity (lihat riwayat PersistentCookiesStorage
// yang sudah dihapus), lalu diminta dikembalikan ke JWT Bearer. Backend
// sekarang menerbitkan token JWT di response login (field "token") DAN tetap
// menerima cookie untuk web/nextjs — dua mekanisme berjalan berdampingan di
// [Authorize(AuthenticationSchemes = "Identity.Application,Bearer")], jadi
// Android cukup pakai Bearer saja tanpa perlu apa pun dari sisi cookie.
private val AuthPlugin =
    createClientPlugin("AuthPlugin") {
        onRequest { request, _ ->
            val token = SessionManager.token
            if (!token.isNullOrBlank()) {
                request.headers.append(HttpHeaders.Authorization, "Bearer $token")
            }
        }
    }

object ApiClient {
    // HANYA scheme+host, TANPA path. Backend tidak memakai prefix apa pun,
    // jadi endpoint di setiap ApiX.kt ditulis absolut mulai dari "/"
    // (mis. "/auth/login", "/periods"). Ktor memperlakukan path yang diawali
    // "/" sebagai path ABSOLUT yang menggantikan path bawaan BASE_URL.
    private const val BASE_URL = "https://aumoweb.onrender.com/api"

    // Render free-tier bisa cold start 30-60 detik kalau server sempat tidur.
    // Timeout 10 detik bawaan OkHttp/Ktor terlalu pendek untuk itu — request
    // keburu dianggap gagal (SocketTimeoutException) padahal server sebenarnya
    // cuma masih booting. Nilai ini dipakai di dua lapis (OkHttp engine DAN
    // plugin HttpTimeout) supaya keduanya konsisten memberi waktu cukup.
    private const val NETWORK_TIMEOUT_SECONDS = 45L

    val client: HttpClient by lazy {
        HttpClient(OkHttp) {
            // expectSuccess = false: Ktor tidak throw untuk status 4xx/5xx,
            // sehingga caller bisa memeriksa status dan membaca body error.
            expectSuccess = false
            install(AuthPlugin)
            install(ContentNegotiation) {
                gson()
            }
            install(Logging) {
                level = LogLevel.INFO
            }
            install(HttpTimeout) {
                requestTimeoutMillis = NETWORK_TIMEOUT_SECONDS * 1000
                connectTimeoutMillis = NETWORK_TIMEOUT_SECONDS * 1000
                socketTimeoutMillis = NETWORK_TIMEOUT_SECONDS * 1000
            }
            engine {
                config {
                    connectTimeout(NETWORK_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                    readTimeout(NETWORK_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                    writeTimeout(NETWORK_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                }
            }
            defaultRequest {
                url(BASE_URL)
            }
        }.also { httpClient ->
            // expectSuccess = false membuat status 4xx/5xx tidak melempar exception,
            // jadi tanpa ini kegagalan HTTP tidak pernah tercatat. Hanya method, path,
            // dan status yang dicatat (tanpa query/body/token).
            httpClient.plugin(HttpSend).intercept { request ->
                val call = execute(request)
                val status = call.response.status.value
                val path = call.request.url.encodedPath
                if (status >= 400) {
                    val message = "${call.request.method.value} $path -> $status"
                    if (status >= 500) AppLogger.error("HTTP", message) else AppLogger.warn("HTTP", message)
                }
                // 401 di endpoint terproteksi = token tidak berlaku lagi. Bersihkan
                // sesi, arahkan ke Login, dan hentikan pemanggil (lihat
                // SessionExpiredException) alih-alih membiarkannya mem-parse body kosong.
                if (SessionExpiredHandler.isSessionExpiry(status, path)) {
                    SessionExpiredHandler.handle()
                    throw SessionExpiredException()
                }
                call
            }
        }
    }
}
