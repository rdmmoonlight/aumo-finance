package com.aumofinance.app.crashlog

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
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
import com.aumofinance.app.ui.theme.AumoColors
import com.aumofinance.app.ui.theme.AumoDimens

/** Layar untuk melihat, menyalin, dan menghapus log tersimpan. */
@Composable
fun CrashLogScreen(
    content: String,
    onCopyClick: () -> Unit,
    onClearClick: () -> Unit,
) {
    Scaffold(containerColor = AumoColors.Background) { innerPadding ->
        Column(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(AumoDimens.SpacingLarge),
                horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(8.dp),
            ) {
                Button(
                    onClick = onCopyClick,
                    colors = ButtonDefaults.buttonColors(containerColor = AumoColors.Primary),
                    modifier = Modifier.weight(1f).heightIn(min = AumoDimens.ButtonHeight),
                ) {
                    Text("Copy Log", color = AumoColors.TextPrimary)
                }
                Button(
                    onClick = onClearClick,
                    colors = ButtonDefaults.buttonColors(containerColor = AumoColors.Bad),
                    modifier = Modifier.weight(1f).heightIn(min = AumoDimens.ButtonHeight),
                ) {
                    Text("Clear Log", color = AumoColors.TextPrimary)
                }
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
