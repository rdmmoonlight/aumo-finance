#!/usr/bin/env python3
from pathlib import Path
root = Path.cwd()
for _ in range(6):
    if (root / "src" / "test" / "auth.ts").exists():
        break
    root = root.parent
root = Path.cwd() if root == Path("/") else root

files = [
    root / "src" / "test" / "auth.ts",
    root / "src" / "common" / "guards" / "auth.guard.ts",
    root / "src" / "common" / "decorators" / "current-session.decorator.ts",
    root / "src" / "test" / "pipeline.ts",
]

for fp in files:
    if fp.exists():
        print(f"\n===== {fp} =====")
        txt = fp.read_text(encoding="utf-8", errors="ignore")
        # print only relevant parts for auth.ts
        if "auth.ts" in str(fp) and "test" in str(fp):
            # find me section
            for i, line in enumerate(txt.splitlines()):
                if "GET /auth/me" in line or "change-password" in line or "sessions" in line or "CurrentSession" in line or "authService" in line.lower() or "mock" in line.lower():
                    print(f"{i+1}: {line}")
            # print full around me
            idx = txt.find("GET /auth/me")
            if idx != -1:
                print("\n--- snippet around /me 200 test ---")
                print(txt[max(0, idx-1000):idx+1500])
        else:
            print(txt[:2000])
    else:
        print(f"\n===== {fp} NOT FOUND =====")

# also check all rate-limit files
print("\n===== SEARCH rate-limit message =====")
for f in (root / "src").rglob("*.ts"):
    t = f.read_text(encoding="utf-8", errors="ignore")
    if "Terlalu banyak" in t:
        print(f"{f}: { [l.strip() for l in t.splitlines() if 'Terlalu banyak' in l] }")
