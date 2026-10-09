import os
import re
import subprocess

BASE_DIR = r"E:\Github\aumo-finance\hono"
SRC_DIR = os.path.join(BASE_DIR, "src")

def fix_auth_service_imports():
    """Merapikan import schema di auth.service.ts."""
    auth_service_path = os.path.join(SRC_DIR, "services", "auth.service.ts")
    if os.path.exists(auth_service_path):
        with open(auth_service_path, "r", encoding="utf-8") as f:
            content = f.read()

        new_content = re.sub(
            r'import\s+\*\s+as\s+schema\s+from\s+[\'"].*?schema.*?[\'"];?',
            "import * as schema from '../db/schema.js';",
            content
        )
        if new_content != content:
            with open(auth_service_path, "w", encoding="utf-8") as f:
                f.write(new_content)

def run_pnpm_start():
    print("=== Running `pnpm run start` ===")
    try:
        subprocess.run("pnpm run start", shell=True, cwd=BASE_DIR)
    except KeyboardInterrupt:
        print("\n[INFO] Server dihentikan pengguna.")

if __name__ == "__main__":
    fix_auth_service_imports()
    run_pnpm_start()