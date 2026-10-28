import fs from 'fs-extra';
import path from 'path';

const SRC_DIR = path.resolve('src');
const NEXT_IMPORT_REGEX = /import\s+.*?\s+from\s+['"]next(\/.*?)?['"]/g;

async function scanDirectory(dirPath, results = []) {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
            await scanDirectory(fullPath, results);
        } else if (item.isFile() && /\.(tsx?|jsx?)$/.test(item.name)) {
            const content = await fs.readFile(fullPath, 'utf-8');
            const matches = content.match(NEXT_IMPORT_REGEX);

            if (matches) {
                results.push({
                    filePath: path.relative(SRC_DIR, fullPath),
                    imports: matches.map((m) => m.trim()),
                });
            }
        }
    }

    return results;
}

async function run() {
    console.log('🔍 Memindai impor package next/* di dalam folder src/...\n');

    if (!await fs.pathExists(SRC_DIR)) {
        console.error('❌ Folder src/ tidak ditemukan!');
        return;
    }

    const foundFiles = await scanDirectory(SRC_DIR);

    if (foundFiles.length === 0) {
        console.log('✅ Bersih! Tidak ditemukan berkas yang mengimpor dari next/*.');
        return;
    }

    console.log(`⚠️  Ditemukan ${foundFiles.length} berkas yang masih mengimpor dari next/*:\n`);

    foundFiles.forEach(({ filePath, imports }) => {
        console.log(`📁 src/${filePath}`);
        imports.forEach((imp) => console.log(`   └── ${imp}`));
    });

    console.log('\n💡 Gantikan impor tersebut dengan @tanstack/react-router atau pustaka SPA lainnya.');
}

run().catch(console.error);