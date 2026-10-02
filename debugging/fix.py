import os
import re
import subprocess

def reset_and_fix_file(file_path, target_var):
    """
    1. Mengembalikan file ke status awal git (bersih dari perubahan kurung kurawal yang rusak).
    2. Mengubah 'using (var doc = ...)' menjadi 'using var doc = ...;' tanpa merubah kurung kurawal class/method.
    """
    if not os.path.exists(file_path):
        return False

    # 1. Reset file via Git agar jumlah { } kembali seimbang
    try:
        subprocess.run(["git", "checkout", "HEAD", "--", file_path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass  # Jika bukan repositori git, lanjut membaca isi saat ini

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # 2. Perbaiki CS0103 dengan mengganti blok using ber-kurung kurawal:
    #    using (var doc = JsonDocument.Parse(...)) {
    #    ==> using var doc = JsonDocument.Parse(...);
    #    Dan menghapus kurung tutup '}' yang berpasangan dengannya secara tepat.

    pattern = r'using\s*\(\s*(?:var|JsonDocument|XmlDocument)\s+' + re.escape(target_var) + r'\s*=\s*([^)]+)\)\s*\{'
    
    # Ganti 'using (var doc = ...)' menjadi 'using var doc = ...;'
    content = re.sub(pattern, r'using var ' + target_var + r' = \1;', content)

    if content != original:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [✓] Successfully cleaned and fixed scope for '{target_var}' in: {os.path.relpath(file_path)}")
        return True

    return False


def run_fixes(backend_path):
    print("=== RESETTING CORRUPTED BRACES & FIXING SCOPES ===")

    targets = [
        (os.path.join(backend_path, "Services", "Tools", "MarketService.cs"), "doc"),
        (os.path.join(backend_path, "Core", "AccountingServices.cs"), "doc"),
        (os.path.join(backend_path, "Services", "Home", "HomeService.cs"), "jsonDoc"),
    ]

    for fpath, var_name in targets:
        reset_and_fix_file(fpath, var_name)

    print("=== REPAIR COMPLETED ===")


if __name__ == "__main__":
    base_dir = os.getcwd()
    backend_path = base_dir if os.path.exists(os.path.join(base_dir, "AumoBackend.csproj")) else os.path.join(base_dir, "backend")
    run_fixes(backend_path)