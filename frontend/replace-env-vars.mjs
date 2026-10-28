import fs from 'fs-extra';
import path from 'path';

const SRC_DIR = path.resolve('src');
const ENV_REGEX = /process\.env\.NEXT_PUBLIC_([A-Za-z0-9_]+)/g;

async function processFile(filePath) {
    let content = await fs.readFile(filePath, 'utf-8');

    if (ENV_REGEX.test(content)) {
        const updatedContent = content.replace(ENV_REGEX, 'import.meta.env.PUBLIC_$1');
        await fs.writeFile(filePath, updatedContent, 'utf-8');
        console.log(`✅ Fixed: ${path.relative(SRC_DIR, filePath)}`);
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
    console.log('🚀 Memulai penggantian process.env.NEXT_PUBLIC_ -> import.meta.env.PUBLIC_...\n');
    if (!await fs.pathExists(SRC_DIR)) {
        console.error('❌ Folder src/ tidak ditemukan!');
        return;
    }
    await scanAndFix(SRC_DIR);
    console.log('\n✨ Penggantian selesai!');
}

run().catch(console.error);