import fs from 'fs-extra';
import path from 'path';

const SRC_DIR = path.resolve('src');

async function processFile(filePath) {
    let content = await fs.readFile(filePath, 'utf-8');
    let hasChanged = false;

    // 1. Ganti process.env.NEXT_PUBLIC_VAR -> import.meta.env.PUBLIC_VAR
    if (/process\.env\.NEXT_PUBLIC_/.test(content)) {
        content = content.replace(/process\.env\.NEXT_PUBLIC_([A-Za-z0-9_]+)/g, 'import.meta.env.PUBLIC_$1');
        hasChanged = true;
    }

    // 2. Ganti process.env.PROD -> import.meta.env.PROD
    if (/process\.env\.PROD\b/.test(content)) {
        content = content.replace(/process\.env\.PROD\b/g, 'import.meta.env.PROD');
        hasChanged = true;
    }

    // 3. Ganti process.env.DEV -> import.meta.env.DEV
    if (/process\.env\.DEV\b/.test(content)) {
        content = content.replace(/process\.env\.DEV\b/g, 'import.meta.env.DEV');
        hasChanged = true;
    }

    // 4. Ganti process.env.NODE_ENV -> import.meta.env.MODE
    if (/process\.env\.NODE_ENV\b/.test(content)) {
        content = content.replace(/process\.env\.NODE_ENV\b/g, 'import.meta.env.MODE');
        hasChanged = true;
    }

    if (hasChanged) {
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`✅ Fixed env: src/${path.relative(SRC_DIR, filePath)}`);
    }
}

async function scanAndFix(dirPath) {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
            await scanAndFix(fullPath);
        } else if (item.isFile() && /\.(tsx?|jsx?|mjs|js)$/.test(item.name)) {
            await processFile(fullPath);
        }
    }
}

async function run() {
    console.log('🚀 Memulai pemindaian dan penggantian process.env -> import.meta.env...\n');
    if (!await fs.pathExists(SRC_DIR)) {
        console.error('❌ Folder src/ tidak ditemukan!');
        return;
    }
    await scanAndFix(SRC_DIR);
    console.log('\n✨ Pemindaian dan perbaikan selesai!');
}

run().catch(console.error);