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

// 1. Fix Program.cs (Add missing extensions namespace)
updateFile(path.join(__dirname, 'Program.cs'), (content) => {
    let updated = content;
    if (!updated.includes('using AumoBackend.Extensions;')) {
        updated = 'using AumoBackend.Extensions;\n' + updated;
    }
    return updated;
});

// 2. Fix BuildTrialBalanceRowsAsync accessibility & references
const filesCallingBuildRows = [
    path.join(__dirname, 'Controllers', 'Reports', 'TrialBalancesController.cs'),
    path.join(__dirname, 'Controllers', 'Reports', 'JournalsController.cs'),
    path.join(__dirname, 'Controllers', 'Reports', 'FinancialStatementsController.cs'),
    path.join(__dirname, 'Services', 'Reports', 'Journals', 'JournalsService.cs'),
    path.join(__dirname, 'Services', 'Reports', 'FinancialStatements', 'FinancialStatementsService.cs')
];

filesCallingBuildRows.forEach((filePath) => {
    updateFile(filePath, (content) => {
        let updated = content;
        // Make method public in Controller
        updated = updated.replace(/(private|protected|internal)(\s+async\s+Task[^\n]*BuildTrialBalanceRowsAsync|\s+Task[^\n]*BuildTrialBalanceRowsAsync)/g, 'public$2');
        // Align caller class name reference if singular was used
        updated = updated.replace(/TrialBalanceController\.BuildTrialBalanceRowsAsync/g, 'TrialBalancesController.BuildTrialBalanceRowsAsync');
        return updated;
    });
});

// 3. Fix WorksheetService.cs (NeondbContext DbSet reference)
updateFile(path.join(__dirname, 'Services', 'Reports', 'Worksheet', 'WorksheetService.cs'), (content) => {
    let updated = content;
    // Change .Accounts back to .ChartOfAccounts based on EF Core Scaffold model
    updated = updated.replace(/\._context\.Accounts/g, '._context.ChartOfAccounts');
    return updated;
});

// 4. Fix DTO Property Mapping in TrialBalancesService.cs
updateFile(path.join(__dirname, 'Services', 'Reports', 'TrialBalances', 'TrialBalancesService.cs'), (content) => {
    let updated = content;
    // Adapt property calls to fit actual DTO structure if needed
    updated = updated.replace(/\.AccountId/g, '.Id');
    return updated;
});

console.log('\n[SUCCESS] Script v3 selesai! Silakan jalankan `dotnet build`.');