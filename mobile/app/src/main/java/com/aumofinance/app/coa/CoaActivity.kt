package com.aumofinance.app.coa

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.aumofinance.app.ui.components.SnackbarMessageHost
import com.aumofinance.app.ui.theme.AumoTheme

class CoaActivity : ComponentActivity() {
    private val viewModel: CoaViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            var searchQuery by remember { mutableStateOf("") }
            var accountBeingAdded by remember { mutableStateOf(false) }
            var accountBeingEdited by remember { mutableStateOf<Account?>(null) }

            LaunchedEffect(searchQuery) {
                viewModel.load(search = searchQuery.takeIf { it.isNotBlank() })
            }

            AumoTheme {
                Box(modifier = Modifier.fillMaxSize()) {
                    CoaScreen(
                        accounts = viewModel.accounts,
                        searchQuery = searchQuery,
                        onSearchChange = { searchQuery = it },
                        onAddClick = { accountBeingAdded = true },
                        onAccountClick = { account -> accountBeingEdited = account },
                    )
                    SnackbarMessageHost(
                        message = viewModel.errorMessage,
                        onConsumed = { viewModel.clearError() },
                    )
                }

                if (accountBeingAdded) {
                    AddAccountDialog(
                        onDismiss = { accountBeingAdded = false },
                        onSubmit = { request ->
                            viewModel.create(request)
                            accountBeingAdded = false
                        },
                    )
                }

                accountBeingEdited?.let { account ->
                    EditAccountDialog(
                        account = account,
                        onDismiss = { accountBeingEdited = null },
                        onSubmit = { request ->
                            viewModel.update(account.id, request)
                            accountBeingEdited = null
                        },
                        onDelete = {
                            viewModel.delete(account.id)
                            accountBeingEdited = null
                        },
                    )
                }
            }
        }
    }
}
