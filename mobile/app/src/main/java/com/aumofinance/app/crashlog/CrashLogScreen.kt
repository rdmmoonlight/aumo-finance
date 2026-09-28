package com.aumofinance.app.crashlog

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aumofinance.app.ui.theme.AumoColors
import com.aumofinance.app.ui.theme.AumoDimens

/** Padanan Compose dari activity_crash_log.xml. */
@Composable
fun CrashLogScreen(
    content: String,
    onCopyClick: () -> Unit,
) {
    Scaffold(containerColor = AumoColors.Background) { innerPadding ->
        Column(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            Button(
                onClick = onCopyClick,
                colors = ButtonDefaults.buttonColors(containerColor = AumoColors.Primary),
                modifier = Modifier.fillMaxWidth().padding(AumoDimens.SpacingLarge).heightIn(min = AumoDimens.ButtonHeight),
            ) {
                Text("Copy Crash Log", color = AumoColors.TextPrimary)
            }

            Text(
                text = content,
                color = AumoColors.TextPrimary,
                fontFamily = FontFamily.Monospace,
                fontSize = MaterialTheme.typography.labelMedium.fontSize,
                modifier =
                    Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(AumoDimens.SpacingLarge),
            )
        }
    }
}
