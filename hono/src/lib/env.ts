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
    JWT_ISSUER: z.string().min(2, 'JWT_ISSUER minimal 2 karakter').default('hono'),

    // Better Auth
    BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET minimal 32 karakter').optional(),
    BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL harus berupa URL yang valid').optional(),

    // Third Party Services & Storage
    API_KEY: z.string().min(1, 'API_KEY wajib diisi').optional(),

    // AWS / S3 Configuration
    AWS_ENDPOINT_URL_S3: z.string().url('AWS_ENDPOINT_URL_S3 harus berupa URL yang valid').optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().default('ap-southeast-1'),
    S3_BUCKET: z.string().default('assets'),
    PUBLIC_API_URL: z.string().url('PUBLIC_API_URL harus berupa URL yang valid').optional(),

    // HTTP pipeline (CORS, body limit, rate limit)
    FRONTEND_URL: z.string().url('FRONTEND_URL harus berupa URL yang valid').optional(),
    CORS_ORIGINS: z.string().optional(), // daftar origin dipisah koma
    BODY_LIMIT_BYTES: z.coerce.number().int().positive().default(1_048_576), // 1 MB
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
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