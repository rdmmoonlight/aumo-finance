import fs from 'fs-extra';
import path from 'path';

const SRC_DIR = path.resolve('src');

async function processFile(filePath) {
    let content = await fs.readFile(filePath, 'utf-8');

    // Abaikan proxy.ts karena menggunakan next/server (Edge API / Proxy Next.js)
    if (filePath.endsWith('proxy.ts')) return;

    let hasChanged = false;

    // 1. Ganti import Link from "next/link" -> import { Link } from "@tanstack/react-router"
    if (content.includes('next/link')) {
        content = content.replace(
            /import\s+Link\s+from\s+['"]next\/link['"];?/g,
            `import { Link } from '@tanstack/react-router';`
        );

        // Ganti atribut href= menjadi to= pada tag <Link>
        content = content.replace(/(<Link\s+[^>]*?\b)href=/g, '$1to=');
        hasChanged = true;
    }

    // 2. Ganti import { useRouter, usePathname, useSearchParams } from "next/navigation"
    if (content.includes('next/navigation')) {
        // Tangkap hook yang di-import dari next/navigation
        const navImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]next\/navigation['"];?/g;

        content = content.replace(navImportRegex, (_, importsString) => {
            const hooks = importsString.split(',').map((h) => h.trim());
            const mappedHooks = [];

            hooks.forEach((hook) => {
                if (hook === 'useRouter') mappedHooks.push('useNavigate');
                else if (hook === 'usePathname') mappedHooks.push('useLocation');
                else if (hook === 'useSearchParams') mappedHooks.push('useSearch');
                else mappedHooks.push(hook);
            });

            return `import { ${mappedHooks.join(', ')} } from '@tanstack/react-router';`;
        });

        // Sesuaikan pemanggilan hook di dalam komponen
        content = content.replace(/\buseRouter\(\)/g, 'useNavigate()');
        content = content.replace(/\busePathname\(\)/g, 'useLocation().pathname');

        hasChanged = true;
    }

    // 3. Gabungkan beberapa import dari @tanstack/react-router jika ada duplikasi
    if (hasChanged) {
        const tanstackImports = [];
        const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@tanstack\/react-router['"];?/g;

        let match;
        while ((match = importRegex.exec(content)) !== null) {
            match[1].split(',').forEach((item) => {
                const trimmed = item.trim();
                if (trimmed && !tanstackImports.includes(trimmed)) {
                    tanstackImports.push(trimmed);
                }
            });
        }

        if (tanstackImports.length > 0) {
            // Hapus baris-baris import TanStack lama
            content = content.replace(importRegex, '');
            // Sisipkan import tunggal yang sudah digabung di bagian atas file
            content = `import { ${tanstackImports.join(', ')} } from '@tanstack/react-router';\n` + content.trimStart();
        }

        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`✅ Fixed: ${path.relative(SRC_DIR, filePath)}`);
    }
}

async function scanAndFix(dirPath) {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
            await scanAndFix(fullPath);
        } else if (item.isFile() && /\.(tsx?|jsx?)$/.test(item.name)) {
            await processFile(fullPath);
        }
    }
}

async function run() {
    console.log('🚀 Mengganti import next/link & next/navigation ke TanStack Router...\n');
    await scanAndFix(SRC_DIR);
    console.log('\n✨ Penggantian selesai! Silakan hapus file src/proxy.ts jika tidak digunakan.');
}

run().catch(console.error);