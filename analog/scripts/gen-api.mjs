import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_API_URL || 'http://localhost:5000';
console.log(`📡 Pulling OpenAPI spec dari: ${url}/openapi.json`);

try {
    execSync(`pnpm dlx openapi-typescript ${url}/openapi.json -o src/app/core/api/v1.d.ts`, {
        stdio: 'inherit',
    });
} catch (error) {
    console.error('❌ Gagal generate API types. Pastikan server NestJS sudah berjalan!');
    process.exit(1);
}