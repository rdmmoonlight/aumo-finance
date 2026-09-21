package com.aumofinance.app.home

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.aumofinance.app.ui.icons.TablerIcon
import com.aumofinance.app.ui.icons.TablerIcons
import com.aumofinance.app.ui.theme.AumoColors
import java.util.Calendar as JavaCalendar

data class HomeMenuItem(
    val title: String,
    val subtitle: String,
    val icon: String,
    val onClick: () -> Unit,
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    dashboard: HomeMenuItem,
    journalEntry: HomeMenuItem,
    generalJournal: HomeMenuItem,
    periods: HomeMenuItem,
    coa: HomeMenuItem,
    reports: HomeMenuItem,
    isDbConnected: Boolean,
    onSettingsClick: () -> Unit,
) {
    val greeting = remember { getDynamicGreeting() }

    Scaffold(
        containerColor = AumoColors.Background,
        topBar = { PremiumTopBar(isDbConnected, onSettingsClick) }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(innerPadding),
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            item {
                Column(modifier = Modifier.animateItem()) {
                    Text(
                        text = "Assalaamu'alaikum wa rahmatullahi wa barakaatuh",
                        color = AumoColors.TextMuted,
                        style = MaterialTheme.typography.labelLarge,
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = greeting,
                        color = AumoColors.TextPrimary,
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.ExtraBold
                        ),
                    )
                }
            }

            item { HeroDashboardCard(item = dashboard, modifier = Modifier.animateItem()) }

            item {
                SectionLabel("MAIN MENU", modifier = Modifier.animateItem())
            }

            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.animateItem()) {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        BentoCard(item = journalEntry, modifier = Modifier.weight(1f))
                        BentoCard(item = generalJournal, modifier = Modifier.weight(1f))
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        BentoCard(item = periods, modifier = Modifier.weight(1f))
                        BentoCard(item = coa, modifier = Modifier.weight(1f))
                    }
                }
            }

            item { SectionLabel("REPORTS", modifier = Modifier.animateItem()) }

            item { SecondaryHeroCard(item = reports, modifier = Modifier.animateItem()) }
        }
    }
}

@Composable
private fun PremiumTopBar(isDbConnected: Boolean, onSettingsClick: () -> Unit) {
    val infinite = rememberInfiniteTransition(label = "blink")
    val blinkAlpha by infinite.animateFloat(
        initialValue = 0.3f, targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse),
        label = "blink"
    )

    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                "Aumo Finance",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black),
                color = AumoColors.TextPrimary
            )
            Spacer(Modifier.height(6.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(100.dp))
                    .background(if (isDbConnected) Color(0xFFDCFCE7) else Color(0xFFFFF8E1))
                    .border(1.dp, if (isDbConnected) Color(0xFF86EFAC).copy(0.5f) else Color(0xFFFFE082), RoundedCornerShape(100.dp))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Box(
                    Modifier.size(6.dp).alpha(if (isDbConnected) 1f else blinkAlpha)
                        .clip(CircleShape)
                        .background(if (isDbConnected) Color(0xFF16A34A) else Color(0xFFFFC107))
                )
                Spacer(Modifier.width(6.dp))
                Text(
                    text = if (isDbConnected) "Live • Connected" else "Waking up server...",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = if (isDbConnected) Color(0xFF15803D) else Color(0xFF8D6E00)
                )
            }
        }

        Box(
            Modifier.size(42.dp).clip(CircleShape)
                .background(AumoColors.SurfaceElevated)
                .border(1.dp, AumoColors.TextPrimary.copy(0.06f), CircleShape)
                .clickable(onClick = onSettingsClick),
            contentAlignment = Alignment.Center
        ) {
            TablerIcon(TablerIcons.Settings, tint = AumoColors.TextPrimary, size = 20.dp)
        }
    }
}

@Composable
private fun SectionLabel(text: String, modifier: Modifier = Modifier) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = modifier.padding(top = 4.dp)) {
        Text(
            text, color = AumoColors.TextMuted,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Bold, letterSpacing = androidx.compose.ui.unit.TextUnit(1.2f, androidx.compose.ui.unit.TextUnitType.Sp)
            )
        )
        Spacer(Modifier.width(8.dp))
        Box(Modifier.height(1.dp).width(24.dp).background(AumoColors.TextMuted.copy(0.15f)))
    }
}

@Composable
private fun HeroDashboardCard(item: HomeMenuItem, modifier: Modifier = Modifier) {
    val gradient = Brush.linearGradient(
        colors = listOf(AumoColors.Primary, Color(0xFF1E3A5F), AumoColors.Primary)
    )
    Card(
        onClick = item.onClick,
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        modifier = modifier.fillMaxWidth().height(148.dp)
    ) {
        Box(
            Modifier.fillMaxSize().background(gradient).padding(20.dp)
        ) {
            // decorative blobs
            Box(Modifier.size(180.dp).offset(x = 120.dp, y = (-40).dp).clip(CircleShape).background(Color.White.copy(0.08f)))
            Box(Modifier.size(120.dp).offset(x = (-20).dp, y = 80.dp).clip(CircleShape).background(Color.White.copy(0.06f)))

            Row(Modifier.fillMaxSize(), verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier.size(56.dp).clip(RoundedCornerShape(16.dp))
                        .background(Color.White.copy(0.14f))
                        .border(1.dp, Color.White.copy(0.18f), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    TablerIcon(item.icon, tint = Color.White, size = 28.dp)
                }
                Spacer(Modifier.width(16.dp))
                Column(Modifier.weight(1f)) {
                    Text(item.title, color = Color.White, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                    Spacer(Modifier.height(4.dp))
                    Text(item.subtitle, color = Color.White.copy(0.75f), style = MaterialTheme.typography.bodySmall, lineHeight = MaterialTheme.typography.bodySmall.lineHeight)
                }
                Box(Modifier.size(32.dp).clip(CircleShape).background(Color.White.copy(0.12f)), contentAlignment = Alignment.Center) {
                    TablerIcon(TablerIcons.ChevronRight, tint = Color.White, size = 18.dp)
                }
            }
        }
    }
}

@Composable
private fun BentoCard(item: HomeMenuItem, modifier: Modifier = Modifier) {
    Card(
        onClick = item.onClick,
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = AumoColors.Surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, AumoColors.TextPrimary.copy(0.06f)),
        modifier = modifier.height(142.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.SpaceBetween) {
            Box(
                Modifier.size(42.dp).clip(RoundedCornerShape(12.dp))
                    .background(AumoColors.Primary.copy(0.1f)),
                contentAlignment = Alignment.Center
            ) {
                TablerIcon(item.icon, tint = AumoColors.Primary, size = 20.dp)
            }
            Column {
                Text(item.title, color = AumoColors.TextPrimary, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.titleSmall)
                Spacer(Modifier.height(2.dp))
                Text(item.subtitle, color = AumoColors.TextMuted, style = MaterialTheme.typography.labelSmall, maxLines = 2)
            }
        }
    }
}

@Composable
private fun SecondaryHeroCard(item: HomeMenuItem, modifier: Modifier = Modifier) {
    Card(
        onClick = item.onClick,
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = AumoColors.SurfaceElevated),
        border = androidx.compose.foundation.BorderStroke(1.dp, AumoColors.TextPrimary.copy(0.06f)),
        modifier = modifier.fillMaxWidth()
    ) {
        Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(AumoColors.TextPrimary),
                contentAlignment = Alignment.Center
            ) {
                TablerIcon(item.icon, tint = Color.White, size = 24.dp)
            }
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(item.title, fontWeight = FontWeight.Bold, color = AumoColors.TextPrimary, style = MaterialTheme.typography.titleMedium)
                Text(item.subtitle, color = AumoColors.TextMuted, style = MaterialTheme.typography.bodySmall)
            }
            TablerIcon(TablerIcons.ChevronRight, tint = AumoColors.TextMuted, size = 18.dp)
        }
    }
}

private fun getDynamicGreeting(): String {
    val h = JavaCalendar.getInstance().get(JavaCalendar.HOUR_OF_DAY)
    return when (h) {
        in 4..11 -> "Selamat pagi"
        in 12..14 -> "Selamat siang"
        in 15..17 -> "Selamat sore"
        in 18..20 -> "Selamat malam"
        else -> "Barakallahu fiik, selamat beristirahat"
    }
}

object HomeIcons {
    val Dashboard = TablerIcons.LayoutDashboard
    val JournalEntry = TablerIcons.FilePlus
    val GeneralJournal = TablerIcons.Book
    val Periods = TablerIcons.Calendar
    val Coa = TablerIcons.GitFork
    val Reports = TablerIcons.ReportAnalytics
}
