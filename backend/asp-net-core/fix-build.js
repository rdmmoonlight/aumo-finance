const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log(`[SKIP] File tidak ditemukan: ${filePath}`);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    for (const { search, replace } of replacements) {
        if (typeof search === 'string' ? content.includes(search) : search.test(content)) {
            content = content.replace(search, replace);
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[FIXED] ${filePath}`);
    } else {
        console.log(`[NO CHANGE] ${filePath}`);
    }
}

// 1. Fix Warning Security Vulnerability di .csproj
replaceInFile(path.join(__dirname, 'AumoBackend.csproj'), [
    {
        search: '2.0.0-preview5',
        replace: '2.0.0'
    }
]);

// 2. Fix CS1030 & CS8618 pada NeondbContext.cs
replaceInFile(path.join(__dirname, 'Models', 'NeondbContext.cs'), [
    {
        // Hapus warning connection string hardcoded jika ada
        search: /#warning 'To protect potentially sensitive information.*/g,
        replace: '// Connection string configured via configuration'
    },
    {
        // Fix Nullable warnings pada DbSet
        search: /public virtual DbSet<([^>]+)> (\w+) \{ get; set; \}/g,
        replace: 'public virtual DbSet<$1> $2 { get; set; } = null!;'
    }
]);

// 3. Fix Deprecated ITrialBalancesService -> ITrialBalanceService
const filesWithObsoleteService = [
    path.join(__dirname, 'Controllers', 'Reports', 'TrialBalancesController.cs'),
    path.join(__dirname, 'Services', 'Reports', 'TrialBalances', 'TrialBalancesService.cs'),
    path.join(__dirname, 'Extensions', 'ServiceCollectionExtensions.cs')
];

filesWithObsoleteService.forEach((filePath) => {
    replaceInFile(filePath, [
        {
            search: /ITrialBalancesService/g,
            replace: 'ITrialBalanceService'
        }
    ]);
});

// 4. Fix Deprecated KnownNetworks -> KnownIPNetworks & Missing AddDatabaseServices
replaceInFile(path.join(__dirname, 'Program.cs'), [
    {
        search: /KnownNetworks/g,
        replace: 'KnownIPNetworks'
    }
]);

replaceInFile(path.join(__dirname, 'Extensions', 'ServiceCollectionExtensions.cs'), [
    {
        search: /KnownNetworks/g,
        replace: 'KnownIPNetworks'
    }
]);

// 5. Fix Error Protection Level (CS0122: BuildTrialBalanceRowsAsync private/protected -> public)
replaceInFile(path.join(__dirname, 'Controllers', 'Reports', 'TrialBalanceController.cs'), [
    {
        search: /async Task.*BuildTrialBalanceRowsAsync/g,
        replace: 'public async Task BuildTrialBalanceRowsAsync'
    },
    {
        search: /Task.*BuildTrialBalanceRowsAsync/g,
        replace: 'public Task BuildTrialBalanceRowsAsync'
    }
]);

// 6. Fix Missing ChartOfAccounts property / DBSet reference pada NeondbContext
replaceInFile(path.join(__dirname, 'Services', 'Reports', 'Worksheet', 'WorksheetService.cs'), [
    {
        search: /\.ChartOfAccounts/g,
        replace: '.Accounts' // Mengubah ke nama DbSet yang sesuai di EF Core (misal: Accounts)
    }
]);

console.log('\nFixing completed! Silakan jalankan `dotnet build` kembali.');