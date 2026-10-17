import re
from pathlib import Path

BASE_PATH = Path(r"E:\Github\aumo-finance\backend\asp-net-core")

def generate_summary(name: str) -> str:
    words = re.findall(r'[A-Z]?[a-z0-9]+|[A-Z]+(?=[A-Z][a-z0-9]|\b)', name)
    phrase = " ".join(words) if words else name

    if name.endswith("Controller"):
        return f"Controller API untuk mengelola {phrase.replace('Controller', '').strip()}."
    elif name.endswith("Service") or (name.startswith("I") and name.endswith("Service")):
        return f"Layanan logika bisnis untuk {phrase}."
    elif name.endswith("Validator"):
        return f"Validator untuk {phrase}."
    elif name.endswith("Dto") or name.endswith("Request") or name.endswith("Response") or name.endswith("ViewModel"):
        return f"Model data {phrase}."
    elif "DbContext" in name:
        return f"Konteks database Entity Framework {phrase}."
    elif name.startswith("Get"):
        return f"Mengambil data {phrase[3:]}."
    elif name.startswith("Create") or name.startswith("Add"):
        return f"Membuat data {phrase[6:] if name.startswith('Create') else phrase[3:]} baru."
    elif name.startswith("Update") or name.startswith("Edit"):
        return f"Memperbarui data {phrase[6:] if name.startswith('Update') else phrase[4:]}."
    elif name.startswith("Delete") or name.startswith("Remove"):
        return f"Menghapus data {phrase[6:] if name.startswith('Delete') else phrase[6:]}."
    elif name.startswith("On"):
        return f"Konfigurasi hook/event {phrase}."
    elif name.startswith("Generate") or name.startswith("Build") or name.startswith("Compute"):
        return f"Proses eksekusi/kalkulasi {phrase}."
    else:
        return f"Mewakili {phrase}."

def process_cs_file(file_path: Path):
    content = file_path.read_text(encoding="utf-8")
    lines = content.splitlines()

    # TAHAP 1: Hapus semua komentar /// untuk reset kondisi
    clean_lines = [line for line in lines if not line.strip().startswith("///")]

    # TAHAP 2: Sisipkan XML Documentation persis di ATAS blok atribut
    final_lines = []
    in_enum = False

    i = 0
    while i < len(clean_lines):
        line = clean_lines[i]
        stripped = line.strip()

        if "enum " in line and not stripped.startswith("//"):
            in_enum = True
        elif in_enum and "}" in stripped:
            in_enum = False

        # Deteksi deklarasi public, override, interface implementation, atau enum item
        is_public_decl = (
            re.match(r'^\s*public\s+', line) or 
            re.match(r'^\s*protected\s+override\s+', line) or
            re.match(r'^\s*[\w\.<>?\[\]\s]+\s+I[\w\.<>]+\.\w+\s*\(', line) or
            re.match(r'^\s*(?:Task|ValueTask|void|bool|string|int|Guid|IEnumerable|List)?<?[\w\s,<>?]*>?\s+I[\w\.<>]+\.\w+\s*\(', line)
        ) and not stripped.startswith("namespace") and not stripped.startswith("using")

        is_enum_item = in_enum and re.match(r'^\s*[A-Z]\w+\s*(?:=|,|$)', line) and not stripped.startswith("//") and not stripped.startswith("{")

        if (is_public_decl or is_enum_item) and not stripped.startswith("//"):
            # Cari baris PALING ATAS dari seluruh atribut [...] di atas deklarasi ini
            insert_pos = len(final_lines)
            while insert_pos > 0:
                prev_line = final_lines[insert_pos - 1].strip()
                if prev_line.startswith("[") or prev_line.endswith("]") or prev_line.startswith("//"):
                    insert_pos -= 1
                else:
                    break

            # Ekstrak nama identifier
            match = re.search(r'(?:\bpublic\s+)?(?:\bprotected\s+)?(?:\boverride\s+)?(?:[a-zA-Z0-9_<>?\[\]\.\s]+\s+)?(?P<name>[a-zA-Z0-9_]+)\s*[\(\{\;,:=]?', line)
            if match:
                member_name = match.group("name")
                if member_name not in ["class", "interface", "struct", "enum", "get", "set", "init", "value", "where"]:
                    # Gunakan indentasi dari baris atribut paling atas jika ada
                    target_indent_line = final_lines[insert_pos] if insert_pos < len(final_lines) else line
                    indent = target_indent_line[:len(target_indent_line) - len(target_indent_line.lstrip())]
                    
                    summary = generate_summary(member_name)
                    xml_doc = f"{indent}/// <summary>\n{indent}/// {summary}\n{indent}/// </summary>"
                    final_lines.insert(insert_pos, xml_doc)

        final_lines.append(line)
        i += 1

    new_content = "\n".join(final_lines)
    if new_content != content:
        file_path.write_text(new_content, encoding="utf-8")
        print(f"Fixed: {file_path.relative_to(BASE_PATH)}")

def main():
    count = 0
    for cs_file in BASE_PATH.rglob("*.cs"):
        if "bin" in cs_file.parts or "obj" in cs_file.parts or "Migrations" in cs_file.parts:
            continue
        process_cs_file(cs_file)
        count += 1
    print(f"\nSelesai memproses {count} file .cs!")

if __name__ == "__main__":
    main()