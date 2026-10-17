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
    elif "Validator" in name:
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
    elif name.startswith("Generate") or name.startswith("Build") or name.startswith("Compute") or name.startswith("Refresh"):
        return f"Proses eksekusi kalkulasi {phrase}."
    else:
        return f"Mewakili {phrase}."

def process_cs_file(file_path: Path):
    content = file_path.read_text(encoding="utf-8")
    
    # KASUS KHUSUS: Program.cs tidak butuh XML docs publik. Kita bersihkan seluruh /// yang error.
    if file_path.name == "Program.cs":
        clean_prog = "\n".join([line for line in content.splitlines() if not line.strip().startswith("///")])
        if clean_prog != content:
            file_path.write_text(clean_prog, encoding="utf-8")
        return

    lines = content.splitlines()

    # TAHAP 1: Reset Bersih
    clean_lines = [line for line in lines if not line.strip().startswith("///")]

    final_lines = []
    is_iface_file = file_path.name.startswith("I") and len(file_path.name) > 1 and file_path.name[1].isupper()
    in_enum = False

    # Regex Super Ketat Berbasis Modifier (Mustahil tembus ke dalam method body)
    rx_type = re.compile(r'^\s*(?:public|protected|internal)\s+(?:abstract\s+|sealed\s+|static\s+|partial\s+)*(?:class|interface|record|enum|struct)\s+(?P<name>[A-Z]\w+)')
    rx_ctor = re.compile(r'^\s*(?:public|protected|internal)\s+(?P<name>[A-Z]\w+)\s*\(')
    rx_member = re.compile(r'^\s*(?:public|protected|internal)\s+(?:const\s+|static\s+|readonly\s+|virtual\s+|override\s+|abstract\s+|sealed\s+|required\s+|async\s+|new\s+|partial\s+)*[a-zA-Z0-9_<>\[\]\?\. \t]+\s+(?P<name>[A-Z]\w+)\s*(?:\{|=|;|=>|\(|<)')
    rx_explicit_iface = re.compile(r'^\s*(?:async\s+)?[a-zA-Z0-9_<>\[\]\?\. \t]+\s+I[a-zA-Z0-9_]+\.(?P<name>[A-Z]\w+)\s*(?:<[^>]+>)?\s*\(')
    
    for line in clean_lines:
        stripped = line.strip()
        
        if "enum " in line and not stripped.startswith("//"):
            in_enum = True
        elif in_enum and "}" in stripped:
            in_enum = False

        member_name = None

        if not (stripped == "" or stripped.startswith("//") or stripped.startswith("using ") or stripped.startswith("namespace ") or stripped.startswith("return ") or stripped.startswith("var ")):
            
            # 1. Deteksi Tipe (Class, Record, dll)
            m_type = rx_type.match(line)
            if m_type: member_name = m_type.group("name")
            
            # 2. Deteksi Konstruktor
            if not member_name:
                m_ctor = rx_ctor.match(line)
                if m_ctor: member_name = m_ctor.group("name")
                
            # 3. Deteksi Field, Konstanta, Properti, Method
            if not member_name:
                m_member = rx_member.match(line)
                if m_member: member_name = m_member.group("name")
                
            # 4. Deteksi Explicit Interface (IEmailSender.SendEmailAsync)
            if not member_name and "I" in line and "." in line:
                m_explicit = rx_explicit_iface.match(line)
                if m_explicit: member_name = m_explicit.group("name")
                
            # 5. Deteksi Properti/Method di dalam Interface
            if not member_name and is_iface_file and "=" not in line and "return " not in line:
                m_iface = re.match(r'^\s*[a-zA-Z0-9_<>\[\]\?\. \t]+\s+(?P<name>[A-Z]\w+)\s*(?:\{|=>|;|\(|<)', line)
                if m_iface: member_name = m_iface.group("name")

            # 6. Deteksi Item Enum
            if not member_name and in_enum and not stripped.startswith("{") and not stripped.startswith("["):
                m_enum = re.match(r'^\s*(?P<name>[A-Z]\w+)\s*(?:=[^,]+)?(?:,|$)', line)
                if m_enum: member_name = m_enum.group("name")

        # Filter keamanan anti false-positive
        if member_name in ["Task", "IActionResult", "Guid", "String", "Int32", "Boolean", "DateTime"]:
            member_name = None

        if member_name:
            # BACKTRACK: Temukan posisi teratas dari semua atribut [...]
            insert_pos = len(final_lines)
            while insert_pos > 0:
                prev_line = final_lines[insert_pos - 1].strip()
                if prev_line == "" or prev_line.startswith("[") or prev_line.startswith("//"):
                    insert_pos -= 1
                else:
                    break
                    
            target_indent_line = final_lines[insert_pos] if insert_pos < len(final_lines) else line
            indent = target_indent_line[:len(target_indent_line) - len(target_indent_line.lstrip())]
            
            summary = generate_summary(member_name)
            xml_doc = f"{indent}/// <summary>\n{indent}/// {summary}\n{indent}/// </summary>"
            final_lines.insert(insert_pos, xml_doc)

        final_lines.append(line)

    new_content = "\n".join(final_lines)
    if new_content != content:
        file_path.write_text(new_content, encoding="utf-8")
        print(f"Refactored: {file_path.relative_to(BASE_PATH)}")

def main():
    count = 0
    for cs_file in BASE_PATH.rglob("*.cs"):
        if "bin" in cs_file.parts or "obj" in cs_file.parts or "Migrations" in cs_file.parts:
            continue
        process_cs_file(cs_file)
        count += 1
    print(f"\nSelesai merombak {count} file .cs!")

if __name__ == "__main__":
    main()