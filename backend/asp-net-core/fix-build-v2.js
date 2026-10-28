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

// 1. Fix .csproj: Kembalikan versi OpenApi ke 2.0.0-preview5 agar cocok dengan .NET 10 & Suppress NU1903
updateFile(path.join(__dirname, 'AumoBackend.csproj'), (content) => {
    let updated = content;
    updated = updated.replace(/Include="Microsoft\.OpenApi"\s+Version="[^"]+"/g, 'Include="Microsoft.OpenApi" Version="2.0.0-preview5"');

    if (!updated.includes('NU1903')) {
        if (updated.includes('<NoWarn>')) {
            updated = updated.replace('<NoWarn>', '<NoWarn>NU1903;CS1030;');
        } else {
            updated = updated.replace('</PropertyGroup>', '    <NoWarn>$(NoWarn);NU1903;CS1030</NoWarn>\n  </PropertyGroup>');
        }
    }
    return updated;
});

// 2. Fix CS0122: Ubah BuildTrialBalanceRowsAsync menjadi public di TrialBalancesController.cs
updateFile(path.join(__dirname, 'Controllers', 'Reports', 'TrialBalancesController.cs'), (content) => {
    return content.replace(/(private|protected|internal)(\s+async\s+Task[^\n]*BuildTrialBalanceRowsAsync|\s+Task[^\n]*BuildTrialBalanceRowsAsync)/g, 'public$2');
});

console.log('\n[SUCCESS] Script perbaikan v2 selesai! Silakan jalankan `dotnet build`.');