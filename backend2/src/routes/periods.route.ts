import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createPeriodSchema } from '../db/accounting.schema.js'; // Disesuaikan dengan relative import
import { requireAuth } from '../middleware/auth.middleware.js';
import { periodsService } from '../services/periods.service.js';
import type { AppEnv } from '../types/app.types.js'; // Definisikan atau sesuaikan lokasi AppEnv Anda

// passing AppEnv ke instance Hono agar context `user` terdeteksi dengan tepat
export const periodsRoute = new Hono<AppEnv>();

// Proteksi semua endpoint periode dengan autentikasi
periodsRoute.use('*', requireAuth);

/**
 * GET /api/v1/periods
 * Mengambil daftar seluruh periode pengguna
 */
periodsRoute.get('/', async (c) => {
    const user = c.get('user');
    const result = await periodsService.getPeriods(user.id);
    return c.json(result);
});

/**
 * GET /api/v1/periods/open-info
 * Mengambil informasi akun pembantu saat akan membuka periode baru
 */
periodsRoute.get('/open-info', async (c) => {
    const user = c.get('user');
    const result = await periodsService.getOpenPeriodInfo(user.id);
    return c.json(result);
});

/**
 * POST /api/v1/periods
 * Membuat/membuka periode akuntansi baru
 */
periodsRoute.post('/', zValidator('json', createPeriodSchema), async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');

    const result = await periodsService.createPeriod(user.id, body);

    if (!result.success) {
        const statusCode = result.isServerError ? 500 : 400;
        return c.json(result, statusCode);
    }

    return c.json(result, 201);
});

/**
 * POST /api/v1/periods/select/:id
 * Memilih periode aktif
 */
periodsRoute.post('/select/:id', async (c) => {
    const user = c.get('user');
    const periodId = Number(c.req.param('id'));

    if (isNaN(periodId)) {
        return c.json({ success: false, message: 'Invalid period ID' }, 400);
    }

    const result = await periodsService.selectPeriod(user.id, periodId);
    if (!result) {
        return c.json({ success: false, message: 'Period not found' }, 404);
    }

    return c.json(result);
});

/**
 * DELETE /api/v1/periods/select
 * Menghapus/membersihkan pilihan periode aktif
 */
periodsRoute.delete('/select', async (c) => {
    const user = c.get('user');
    const result = await periodsService.clearSelection(user.id);
    return c.json(result);
});

/**
 * POST /api/v1/periods/:id/close
 * Menutup periode akuntansi
 */
periodsRoute.post('/:id/close', async (c) => {
    const user = c.get('user');
    const periodId = Number(c.req.param('id'));

    if (isNaN(periodId)) {
        return c.json({ success: false, message: 'Invalid period ID' }, 400);
    }

    const result = await periodsService.closePeriod(user.id, periodId);
    if (!result.success) {
        return c.json(result, 400);
    }

    return c.json(result);
});