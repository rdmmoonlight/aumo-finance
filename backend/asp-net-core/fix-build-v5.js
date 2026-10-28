const fs = require('fs');
const path = require('path');

function updateFile(filePath, updater) {
    if (!fs.existsSync(filePath)) {
        console.log(`[SKIP] File tidak ditemukan: ${filePath}`);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = updater(content);
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`[FIXED] ${filePath}`);
    } else {
        console.log(`[NO CHANGE] ${filePath}`);
    }
}

// 1. Fix Program.cs (Import namespace Extension untuk AddDatabaseServices)
updateFile(path.join(__dirname, 'Program.cs'), (content) => {
    let updated = content;
    if (!updated.includes('using AumoBackend.Extensions;')) {
        updated = 'using AumoBackend.Extensions;\n' + updated;
    }
    return updated;
});

// 2. Fix CS0103: Ganti pemanggilan static TrialBalancesController.BuildTrialBalanceRowsAsync
// Menjadi pemanggilan via instance/helper jika controller dipanggil secara salah
const callerFiles = [
    path.join(__dirname, 'Controllers', 'Reports', 'JournalsController.cs'),
    path.join(__dirname, 'Controllers', 'Reports', 'FinancialStatementsController.cs'),
    path.join(__dirname, 'Services', 'Reports', 'Journals', 'JournalsService.cs'),
    path.join(__dirname, 'Services', 'Reports', 'FinancialStatements', 'FinancialStatementsService.cs')
];

callerFiles.forEach((filePath) => {
    updateFile(filePath, (content) => {
        let updated = content;
        // Hapus qualifier static kelas jika method ada di scope internal / di-inject
        updated = updated.replace(/TrialBalancesController\.BuildTrialBalanceRowsAsync/g, 'BuildTrialBalanceRowsAsync');
        updated = updated.replace(/TrialBalanceController\.BuildTrialBalanceRowsAsync/g, 'BuildTrialBalanceRowsAsync');
        return updated;
    });
});

// 3. Fix WorksheetService.cs (DbSet Accounts & reference ke ketiga tabel Trial Balance)
updateFile(path.join(__dirname, 'Services', 'Reports', 'Worksheet', 'WorksheetService.cs'), (content) => {
    let updated = content;
    // Ubah Accounts ke ChartOfAccounts atau DbSet spesifik yang ada di NeondbContext
    updated = updated.replace(/\._context\.Accounts/g, '._context.ChartOfAccounts');
    return updated;
});

// 4. Fix 3 Tabel Trial Balance (Adjusted, Unadjusted, PostClosing) di TrialBalancesService.cs
updateFile(path.join(__dirname, 'Services', 'Reports', 'TrialBalances', 'TrialBalancesService.cs'), (content) => {
    let updated = content;

    // Samakan pengaksesan properti untuk ke-3 DTO / Tabel:
    // (Mengembalikan dari AccountId/DebitAmount/CreditAmount ke nama properti DTO asli)
    updated = updated.replace(/\.AccountId/g, '.AccountCode');
    updated = updated.replace(/\.DebitAmount/g, '.Debit');
    updated = updated.replace(/\.CreditAmount/g, '.Credit');

    return updated;
});

console.log('\n[SUCCESS] Script perbaikan v5 (3 tabel Trial Balance) selesai!');