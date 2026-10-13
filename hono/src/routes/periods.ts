import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { PeriodsService } from '../services/periods';

type CreatePeriodBody = {
    setupMode: 'LoadExisting' | 'CreateNew';
    [key: string]: unknown;
};

export const periodsRoutes = new OpenAPIHono<{
    Variables: { periodsService: PeriodsService; userId: string }
}>()

// 1. Get Periods
const getPeriodsRoute = createRoute({
    method: 'get',
    path: '/',
    responses: {
        200: {
            content: { 'application/json': { schema: z.any() } },
            description: 'Daftar periode',
        },
    },
})

periodsRoutes.openapi(getPeriodsRoute, async (c) => {
    const res = await c.get('periodsService').getPeriods(c.get('userId'))
    return c.json(res, 200)
})

// 2. Open Period Info
const getOpenPeriodInfoRoute = createRoute({
    method: 'get',
    path: '/open-info',
    responses: {
        200: {
            content: { 'application/json': { schema: z.any() } },
            description: 'Info akun periode baru',
        },
    },
})

periodsRoutes.openapi(getOpenPeriodInfoRoute, async (c) => {
    const res = await c.get('periodsService').getOpenPeriodInfo(c.get('userId'))
    return c.json(res, 200)
})

// 3. Create Period
const createPeriodRoute = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: { 'application/json': { schema: z.object({ setupMode: z.enum(['LoadExisting', 'CreateNew']) }).catchall(z.any()) } },
        },
    },
    responses: {
        201: { content: { 'application/json': { schema: z.any() } }, description: 'Berhasil' },
        400: { content: { 'application/json': { schema: z.any() } }, description: 'Gagal' },
    },
})

periodsRoutes.openapi(createPeriodRoute, async (c) => {
    const body = c.req.valid('json')
    const res = await c.get('periodsService').createPeriod(c.get('userId'), body as CreatePeriodBody)
    return c.json(res, res.success ? 201 : 400)
})

// 4. Select Period
const selectPeriodRoute = createRoute({
    method: 'post',
    path: '/:id/select',
    request: {
        params: z.object({ id: z.string().transform(Number) }),
    },
    responses: {
        200: { content: { 'application/json': { schema: z.any() } }, description: 'Berhasil' },
        404: { content: { 'application/json': { schema: z.any() } }, description: 'Tidak ditemukan' },
    },
})

periodsRoutes.openapi(selectPeriodRoute, async (c) => {
    const { id } = c.req.valid('param')
    const res = await c.get('periodsService').selectPeriod(c.get('userId'), id)
    if (!res) return c.json({ success: false, message: 'Not found' }, 404)
    return c.json(res, 200)
})

// 5. Clear Selection
const clearSelectionRoute = createRoute({
    method: 'post',
    path: '/clear-selection',
    responses: {
        200: { content: { 'application/json': { schema: z.any() } }, description: 'Berhasil' },
    },
})

periodsRoutes.openapi(clearSelectionRoute, async (c) => {
    const res = await c.get('periodsService').clearSelection(c.get('userId'))
    return c.json(res, 200)
})

// 6. Close Period
const closePeriodRoute = createRoute({
    method: 'post',
    path: '/:id/close',
    request: {
        params: z.object({ id: z.string().transform(Number) }),
    },
    responses: {
        200: { content: { 'application/json': { schema: z.any() } }, description: 'Berhasil' },
        400: { content: { 'application/json': { schema: z.any() } }, description: 'Gagal' },
    },
})

periodsRoutes.openapi(closePeriodRoute, async (c) => {
    const { id } = c.req.valid('param')
    const res = await c.get('periodsService').closePeriod(c.get('userId'), id)
    return c.json(res, res.success ? 200 : 400)
})