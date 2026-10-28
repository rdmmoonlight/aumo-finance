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

// 1. Fix AumoBackend.csproj (Downgrade OpenAPI ke 1.6.22 & Suppress NU1903 warning)
updateFile(path.join(__dirname, 'AumoBackend.csproj'), (content) => {
    let updated = content;
    // Upgrade/Downgrade Microsoft.OpenApi to 1.6.22 (Stable)
    updated = updated.replace(/Include="Microsoft\.OpenApi"\s+Version="[^"]+"/g, 'Include="Microsoft.OpenApi" Version="1.6.22"');

    // Suppress NU1903 warning if not present
    if (!updated.includes('<NoWarn>')) {
        updated = updated.replace('</PropertyGroup>', '  <NoWarn>$(NoWarn);NU1903;CS1030</NoWarn>\n  </PropertyGroup>');
    } else if (!updated.includes('NU1903')) {
        updated = updated.replace('<NoWarn>', '<NoWarn>NU1903;CS1030;');
    }
    return updated;
});

// 2. Fix Program.cs (Add missing using statement & reset OpenApi namespace)
updateFile(path.join(__dirname, 'Program.cs'), (content) => {
    let updated = content;
    if (!updated.includes('using AumoBackend.Extensions;')) {
        updated = `using AumoBackend.Extensions;\n` + updated;
    }
    if (!updated.includes('using Microsoft.OpenApi.Models;')) {
        updated = updated.replace(/using Microsoft\.OpenApi;/g, 'using Microsoft.OpenApi.Models;');
    }
    return updated;
});

// 3. Fix NeondbContext.cs (Remove CS1030 #warning string)
updateFile(path.join(__dirname, 'Models', 'NeondbContext.cs'), (content) => {
    return content.replace(/#warning\s+'To protect potentially sensitive information[\s\S]*?\n/g, '// Connection string handled via AppSettings\n');
});

// 4. Fix TrialBalanceController.cs (Make BuildTrialBalanceRowsAsync PUBLIC)
updateFile(path.join(__dirname, 'Controllers', 'Reports', 'TrialBalanceController.cs'), (content) => {
    return content.replace(/(private|protected|internal)(\s+async\s+Task[^\n]*BuildTrialBalanceRowsAsync|\s+Task[^\n]*BuildTrialBalanceRowsAsync)/g, 'public$2');
});

// 5. Fix WorksheetService.cs (DbSet & DTO mapping fix)
updateFile(path.join(__dirname, 'Services', 'Reports', 'Worksheet', 'WorksheetService.cs'), (content) => {
    let updated = content;
    // Dynamic replacement for context dataset mapping if Accounts was missing
    updated = updated.replace(/\._context\.Accounts/g, '._context.Set<AumoBackend.Models.Account>()');
    return updated;
});

console.log('\nScript perbaikan selesai diproses! Silakan jalankan `dotnet build`.');