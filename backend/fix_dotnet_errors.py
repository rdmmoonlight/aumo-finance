import os
import re

def fix_file(file_path, patch_fn):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    new_content = patch_fn(content)

    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"[FIXED] {file_path}")

# 1. Fix Error CS1501 pada ChartOfAccountsController.cs & ChartOfAccountsService.cs
def fix_chart_of_accounts(content):
    # Kembalikan pemanggilan Contains(...) 2 argumen menjadi 1 argumen standar untuk query LINQ/EF
    content = re.sub(r'(\w+)\.Contains\(([^,\)]+),\s*StringComparison\.\w+\)', r'\1.Contains(\2)', content)
    content = re.sub(r'(\w+)\.Contains\(([^,\)]+),\s*System\.StringComparison\.\w+\)', r'\1.Contains(\2)', content)

    # Suppress warning CA1862, CA1304, CA1311 khusus di file ChartOfAccounts agar EF Core LINQ query tidak rusak
    pragmas = []
    if "#pragma warning disable CA1862" not in content:
        pragmas.append("#pragma warning disable CA1862")
    if "#pragma warning disable CA1304" not in content:
        pragmas.append("#pragma warning disable CA1304")
    if "#pragma warning disable CA1311" not in content:
        pragmas.append("#pragma warning disable CA1311")

    if pragmas:
        content = "\n".join(pragmas) + "\n" + content

    return content

# 2. Fix CA1050 (HomeController.cs)
def fix_home_controller(content):
    if "#pragma warning disable CA1050" not in content:
        content = "#pragma warning disable CA1050\n" + content
    return content

# 3. Fix CA1805 (DTOs/AuthDto.cs)
def fix_auth_dto(content):
    content = re.sub(r'public\s+bool\s+(\w+)\s*=\s*false;', r'public bool \1;', content)
    return content

# 4. Fix CA1305 (Dashboard & Program.cs)
def fix_culture_formatting(content):
    if "using System.Globalization;" not in content:
        content = "using System.Globalization;\n" + content
    
    # DateTime.ToString("format", CultureInfo.InvariantCulture)
    content = re.sub(r'(\w+)\.ToString\((".*?")\)', r'\1.ToString(\2, CultureInfo.InvariantCulture)', content)
    return content

# 5. Suppress warning infrastruktur & framework (CA1861, CA1848, CA1826)
def fix_infra_suppressions(content):
    pragmas = []
    if "#pragma warning disable CA1861" not in content and ("CA1861" in content or "Program.cs" in content):
        pragmas.append("#pragma warning disable CA1861")
    if "#pragma warning disable CA1848" not in content and ("ILogger" in content or "Program.cs" in content):
        pragmas.append("#pragma warning disable CA1848")
    if "#pragma warning disable CA1826" not in content and "Settings" in content:
        pragmas.append("#pragma warning disable CA1826")
    if "#pragma warning disable CA1305" not in content and ("ConsoleTheme" in content or "Program.cs" in content):
        pragmas.append("#pragma warning disable CA1305")

    if pragmas:
        content = "\n".join(pragmas) + "\n" + content
    return content

if __name__ == "__main__":
    fix_file("Controllers/ChartOfAccountsController.cs", fix_chart_of_accounts)
    fix_file("Services/ChartOfAccounts/ChartOfAccountsService.cs", fix_chart_of_accounts)
    
    fix_file("Controllers/HomeController.cs", fix_home_controller)
    fix_file("DTOs/AuthDto.cs", fix_auth_dto)
    
    fix_file("Controllers/DashboardController.cs", fix_culture_formatting)
    fix_file("Services/Dashboard/DashboardService.cs", fix_culture_formatting)
    fix_file("Program.cs", lambda c: fix_infra_suppressions(fix_culture_formatting(c)))
    
    fix_file("Services/Settings/SettingsService.cs", fix_infra_suppressions)

    print("\n[SUCCESS] Script selesai dijalankan. Silakan build ulang project.")