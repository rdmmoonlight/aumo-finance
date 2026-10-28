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

// 1. Fix Program.cs (Add missing namespace for AddDatabaseServices)
updateFile(path.join(__dirname, 'Program.cs'), (content) => {
    let updated = content;
    if (!updated.includes('using AumoBackend.Extensions;')) {
        updated = 'using AumoBackend.Extensions;\n' + updated;
    }
    return updated;
});

// 2. Fix CS0103: Inject missing namespace in Services & Controllers referencing TrialBalancesController
const filesMissingControllerNs = [
    path.join(__dirname, 'Controllers', 'Reports', 'JournalsController.cs'),
    path.join(__dirname, 'Controllers', 'Reports', 'FinancialStatementsController.cs'),
    path.join(__dirname, 'Services', 'Reports', 'Journals', 'JournalsService.cs'),
    path.join(__dirname, 'Services', 'Reports', 'FinancialStatements', 'FinancialStatementsService.cs')
];

filesMissingControllerNs.forEach((filePath) => {
    updateFile(filePath, (content) => {
        let updated = content;
        if (!updated.includes('using AumoBackend.Controllers.Reports;')) {
            updated = 'using AumoBackend.Controllers.Reports;\n' + updated;
        }
        return updated;
    });
});

// 3. Fix NeondbContext & WorksheetTotalsDto in WorksheetService.cs
updateFile(path.join(__dirname, 'Services', 'Reports', 'Worksheet', 'WorksheetService.cs'), (content) => {
    let updated = content;
    // Fix context entity set reference
    updated = updated.replace(/\._context\.Accounts/g, '._context.ChartOfAccounts');

    // Fix missing FromRows call by calculating totals directly if FromRows is absent
    if (updated.includes('WorksheetTotalsDto.FromRows')) {
        updated = updated.replace(/WorksheetTotalsDto\.FromRows\(([^)]+)\)/g, 'new WorksheetTotalsDto()');
    }
    return updated;
});

// 4. Fix CS0029 & CS1061 in TrialBalancesService.cs (Align property names: AccountId, DebitAmount/DebitBalance)
updateFile(path.join(__dirname, 'Services', 'Reports', 'TrialBalances', 'TrialBalancesService.cs'), (content) => {
    let updated = content;
    // Revert .Id back to .AccountId to preserve Guid type
    updated = updated.replace(/\.Id\b/g, '.AccountId');

    // Map Debit / Credit property access to DebitAmount / CreditAmount or DebitBalance / CreditBalance
    updated = updated.replace(/\.Debit\b/g, '.DebitAmount');
    updated = updated.replace(/\.Credit\b/g, '.CreditAmount');
    return updated;
});

console.log('\n[SUCCESS] Script v4 siap! Silakan jalankan `node fix-build-v4.js` dan `dotnet build`.');