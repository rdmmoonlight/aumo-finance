plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jlleitschuh.gradle.ktlint")
}

android {
    // namespace = paket Kotlin (R class, dst.) — BEBAS beda dari applicationId
    // sejak AGP 7+ memisahkan keduanya, jadi tidak perlu rename seluruh
    // struktur package Kotlin yang sudah ditulis.
    namespace = "com.aumofinance.app"
    compileSdk = 34

    defaultConfig {
        // HARUS "com.bnrc.aumofinance" — ini applicationId asli app MAUI lama
        // (lihat frontend/legacy-maui-reference/AumoFinance.csproj). Kalau beda,
        // Play Store akan menganggap ini aplikasi baru yang terpisah, bukan
        // update dari app existing, dan user lama kehilangan kontinuitas rilis.
        applicationId = "com.bnrc.aumofinance"
        // Locked per project requirement: minSdk must stay at Android 9 (API 28) or below
        minSdk = 28
        targetSdk = 34
        // Bisa dioverride dari CI lewat -PappVersionCode=... -PappVersionName=...
        // (lihat android-build.yml) supaya APK punya versi internal yang
        // konsisten dengan tag GitHub Release yang dipublikasikan — bukan
        // cuma "1.0" statis selamanya. Default di bawah dipakai untuk build
        // lokal (Android Studio/gradlew tanpa CI).
        versionCode = (project.findProperty("appVersionCode") as String?)?.toIntOrNull() ?: 1
        versionName = project.findProperty("appVersionName") as String? ?: "1.0-local"
    }

    buildTypes {
        debug {
            // Signature debug (auto-generated Android debug keystore) TIDAK
            // PERNAH sama dengan keystore signing release — kalau applicationId
            // debug sama persis dengan release, install APK debug di HP yang
            // sudah ada app release akan ditolak Android ("package conflicts
            // with an existing package"). applicationIdSuffix membuat debug
            // punya package ID sendiri (com.bnrc.aumofinance.debug) supaya
            // keduanya bisa terpasang berdampingan tanpa bentrok.
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    // AGP 8+ mewajibkan opt-in eksplisit untuk generate kelas BuildConfig.
    // compose = true mengaktifkan Jetpack Compose (seluruh UI aplikasi).
    buildFeatures {
        buildConfig = true
        compose = true
    }

    // Disesuaikan dengan versi Kotlin 1.9.24
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.core:core-splashscreen:1.0.1")
    // Hanya untuk FragmentActivity yang dibutuhkan androidx.biometric
    // (LoginActivity, SplashActivity); tidak ada AppCompatActivity/View UI.
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.4")
    implementation("androidx.activity:activity-ktx:1.9.1")
    // --- KLIEN HTTP: KTOR ---
    // Engine OkHttp dipakai di bawah Ktor,
    // Gson dipertahankan sebagai serializer supaya semua data class model
    // (request/response) di ApiX.kt tidak perlu anotasi kotlinx.serialization.
    implementation("io.ktor:ktor-client-core:2.3.12")
    implementation("io.ktor:ktor-client-okhttp:2.3.12")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.12")
    implementation("io.ktor:ktor-serialization-gson:2.3.12")
    implementation("io.ktor:ktor-client-logging:2.3.12")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    // Persistensi sesi terenkripsi (EncryptedSharedPreferences) untuk
    // "Ingat saya", dan BiometricPrompt untuk login sidik jari/wajah.
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.biometric:biometric:1.1.0")

    // --- JETPACK COMPOSE (Material3) ---
    val composeBom = platform("androidx.compose:compose-bom:2024.05.00")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    // Dipakai untuk ikon outline Material di halaman Reports menu
    // (ReportsMenuScreen.kt); layar lain memakai TablerIcon (font glyph,
    // lihat com.aumofinance.app.ui.icons.TablerIcons).
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.1")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.4")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
