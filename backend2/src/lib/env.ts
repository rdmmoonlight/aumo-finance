import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),

    // Database & Cache
    DATABASE_URL: z.string().url('DATABASE_URL harus berupa URL yang valid'),
    REDIS_URL: z.string().url('REDIS_URL harus berupa URL yang valid').optional(),

    // OAuth Providers
    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID wajib diisi'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET wajib diisi'),

    // JWT Configuration
    JWT_SIGNING_KEY: z
        .string()
        .min(32, 'JWT_SIGNING_KEY minimal 32 karakter demi keamanan'),
    JWT_ISSUER: z.string().min(2, 'JWT_ISSUER minimal 2 karakter').default('backend2'),

    // Third Party Services
    SUPABASE_URL: z.string().url('SUPABASE_URL harus berupa URL yang valid').optional(),
    SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY wajib diisi').optional(),

    API_KEY: z.string().min(1, 'API_KEY wajib diisi').optional(),
});

const parseEnv = () => {
    const _env = envSchema.safeParse(process.env);

    if (!_env.success) {
        console.error('❌ Environment variables tidak valid:');
        console.error(JSON.stringify(_env.error.format(), null, 2));

        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }

        throw new Error('Environment variables validation failed');
    }

    return _env.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;