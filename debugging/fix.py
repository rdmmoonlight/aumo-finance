import os

def fix_dashboard_service_list_conversion(backend_path):
    fpath = os.path.join(backend_path, "Services", "Dashboard", "DashboardService.cs")
    if not os.path.exists(fpath):
        return

    with open(fpath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Perbaiki baris 204-209 dengan memastikan ekspresi diakhiri dengan .ToList()
    for idx in range(203, min(210, len(lines))):
        line = lines[idx]
        if ".ToList()" not in line:
            # Jika baris diakhiri titik koma, tambahkan .ToList() sebelum titik koma
            if ";" in line:
                # Menangani variasi penutupan tanda kurung LINQ jika ada
                line = line.rstrip().rstrip(";")
                if line.endswith(")"):
                    lines[idx] = line + ".ToList();\n"
                else:
                    lines[idx] = line + ".ToList();\n"
            elif "," in line:
                lines[idx] = line.rstrip().rstrip(",") + ".ToList(),\n"

    with open(fpath, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"  -> Fixed IEnumerable to List conversion in {fpath}")

if __name__ == "__main__":
    base_dir = os.getcwd()
    backend_path = base_dir if os.path.exists(os.path.join(base_dir, "AumoBackend.csproj")) else os.path.join(base_dir, "backend")
    fix_dashboard_service_list_conversion(backend_path)