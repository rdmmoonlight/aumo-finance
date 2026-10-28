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

// 1. Fix warning NU1903 & update Microsoft.OpenApi package version
replaceInFile(path.join(__dirname, 'AumoBackend.csproj'), [
    {
        search: 'Include="Microsoft.OpenApi" Version="2.0.0"',
        replace: 'Include="Microsoft.OpenApi" Version="2.0.1"'
    },
    {
        search: 'Include="Microsoft.OpenApi" Version="2.0.0-preview5"',
        replace: 'Include="Microsoft.OpenApi" Version="2.0.1"'
    }
]);

// 2. Fix error CS0234: Remove obsolete Microsoft.OpenApi.Models using
replaceInFile(path.join(__dirname, 'Program.cs'), [
    {
        search: 'using Microsoft.OpenApi.Models;',
        replace: 'using Microsoft.OpenApi;'
    }
]);

// 3. Fix error CS0528: Duplicate interface inheritance on TrialBalancesService
replaceInFile(path.join(__dirname, 'Services', 'Reports', 'TrialBalances', 'TrialBalancesService.cs'), [
    {
        search: /:\s*ITrialBalanceService\s*,\s*ITrialBalanceService/g,
        replace: ': ITrialBalanceService'
    }
]);

// 4. Fix warning CS1030: Clear EF Core scaffolding #warning directive
replaceInFile(path.join(__dirname, 'Models', 'NeondbContext.cs'), [
    {
        search: /#warning\s+'To protect potentially sensitive information.*/g,
        replace: '// Connection string configured via appsettings'
    }
]);

console.log('\n[DONE] Langkah perbaikan tahap 2 selesai! Jalankan `dotnet build` kembali.');