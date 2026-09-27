package com.aumofinance.app.ui.theme

import androidx.compose.ui.unit.dp

/**
 * Skala density & ruang layar Aumo Finance.
 *
 * Sumber nilai: spesifikasi desain internal Aumo (lihat rujukan lengkap
 * di /docs/spacing-scale.md). Rentang (mis. 8–16dp, 48–56dp, 64–80dp)
 * diwakili oleh dua konstanta *Min/*Max atau *Small/*Large agar tetap
 * type-safe, bukan angka ambang bebas.
 */
object AumoDimens {
    // Screen & Card
    val ScreenPadding = 16.dp
    val CardPadding = 16.dp

    // Spacing (horizontal & vertical, dipakai bersama)
    val SpacingSmall = 8.dp
    val SpacingLarge = 16.dp

    // Komponen interaktif
    val ButtonHeight = 48.dp
    val InputHeightMin = 48.dp
    val InputHeightMax = 56.dp

    // Ikon
    val IconStandard = 24.dp
    val IconSmall = 20.dp

    // Navigasi
    val TopAppBarHeight = 56.dp
    val BottomNavHeightMin = 64.dp
    val BottomNavHeightMax = 80.dp
}
