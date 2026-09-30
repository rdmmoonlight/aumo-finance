package com.aumofinance.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.aumofinance.app.R

val AptosFontFamily =
    FontFamily(
        Font(R.font.aptos_regular, FontWeight.Normal),
        Font(R.font.aptos_bold, FontWeight.Bold),
    )

// Skala ukuran font kustom Aumo. Rujukan lengkap: /docs/typography-scale.md
private val AumoTypography: Typography =
    Typography().run {
        copy(
            displayLarge = displayLarge.copy(fontFamily = AptosFontFamily, fontSize = 32.sp),
            displayMedium = displayMedium.copy(fontFamily = AptosFontFamily),
            displaySmall = displaySmall.copy(fontFamily = AptosFontFamily),
            headlineLarge = headlineLarge.copy(fontFamily = AptosFontFamily, fontSize = 28.sp),
            headlineMedium = headlineMedium.copy(fontFamily = AptosFontFamily, fontSize = 24.sp),
            headlineSmall = headlineSmall.copy(fontFamily = AptosFontFamily, fontSize = 20.sp),
            titleLarge = titleLarge.copy(fontFamily = AptosFontFamily, fontSize = 18.sp),
            titleMedium = titleMedium.copy(fontFamily = AptosFontFamily, fontSize = 16.sp),
            titleSmall = titleSmall.copy(fontFamily = AptosFontFamily),
            bodyLarge = bodyLarge.copy(fontFamily = AptosFontFamily, fontSize = 16.sp),
            bodyMedium = bodyMedium.copy(fontFamily = AptosFontFamily, fontSize = 14.sp),
            bodySmall = bodySmall.copy(fontFamily = AptosFontFamily, fontSize = 13.sp),
            labelLarge = labelLarge.copy(fontFamily = AptosFontFamily),
            labelMedium = labelMedium.copy(fontFamily = AptosFontFamily, fontSize = 12.sp),
            labelSmall = labelSmall.copy(fontFamily = AptosFontFamily, fontSize = 11.sp),
        )
    }

// Palet Matte Black + Ningrat Purple. Primary dan Background harus sama
// dengan colorPrimary dan colorBackground di res/values/themes.xml (latar
// window sebelum Compose tergambar). Disalin manual (bukan dibaca dari
// resource) karena ColorScheme Compose butuh tipe
// androidx.compose.ui.graphics.Color, bukan Int resource.
object AumoColors {
    val Primary = Color(0xFF523363)
    val Background = Color(0xFF0A0A0A)
    val Surface = Color(0xFF141014)
    val SurfaceElevated = Color(0xFF1E121F)
    val Good = Color(0xFF4FA36A)
    val Bad = Color(0xFFD7192F)

    val TextPrimary = Color(0xFFFFFFFF)
    val TextSecondary = Color(0xFFD8D8D8)
    val TextMuted = Color(0xFF9C8FA6)
    val Border = Color(0xFF4A2E59)
}

private val AumoDarkScheme =
    darkColorScheme(
        primary = AumoColors.Primary,
        onPrimary = AumoColors.TextPrimary,
        background = AumoColors.Background,
        onBackground = AumoColors.TextPrimary,
        surface = AumoColors.Surface,
        onSurface = AumoColors.TextPrimary,
        surfaceVariant = AumoColors.SurfaceElevated,
        onSurfaceVariant = AumoColors.TextSecondary,
        error = AumoColors.Bad,
        outline = AumoColors.Border,
    )

@Composable
fun AumoTheme(content: @Composable () -> Unit) {
    // Aplikasi ini satu tema saja (dark, matte) — tidak mengikuti tema sistem.
    MaterialTheme(
        colorScheme = AumoDarkScheme,
        typography = AumoTypography,
        content = content,
    )
}
