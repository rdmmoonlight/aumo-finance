import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { ChartOfAccountsService } from '../services/chart-of-accounts'

export const chartOfAccountsRoutes = new OpenAPIHono<{
    Variables: {
        coaService: ChartOfAccountsService
        userId: string
    }
}>()

// 1. Get Accounts (List & Search)
const getAccountsRoute = createRoute({
    method: 'get',
    path: '/',
    summary: 'Mendapatkan daftar Chart of Accounts dengan filter search dan category',
    request: {
        query: z.object({
            search: z.string().optional(),
            category: z.string().optional(),
        }),
    },
    responses: {
        200: { content: { 'application/json': { schema: z.any() } }, description: 'Daftar akun berhasil diambil' },
    },
})

chartOfAccountsRoutes.openapi(getAccountsRoute, async (c) => {
    const { search, category } = c.req.valid('query')
    const res = await c.get('coaService').getAccounts(c.get('userId'), search, category)
    return c.json(res, 200)
})

// 2. Create Account
const createAccountRoute = createRoute({
    method: 'post',
    path: '/',
    summary: 'Membuat akun baru di Chart of Accounts',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        referenceNumber: z.number().openapi({ example: 101 }),
                        accountName: z.string().min(1).openapi({ example: 'Kas Utama' }),
                        type: z.string().min(1).openapi({ example: 'Assets' }),
                        role: z.string().optional().openapi({ example: 'CashAndEquivalents' }),
                    }),
                },
            },
        },
    },
    responses: {
        200: { content: { 'application/json': { schema: z.any() } }, description: 'Akun berhasil dibuat' },
        400: { content: { 'application/json': { schema: z.any() } }, description: 'Validasi gagal / Nomor referensi sudah digunakan' },
        500: { content: { 'application/json': { schema: z.any() } }, description: 'Error server' },
    },
})

chartOfAccountsRoutes.openapi(createAccountRoute, async (c) => {
    const body = c.req.valid('json')
    const res = await c.get('coaService').createAccount(c.get('userId'), body)
    return c.json(res, res.statusCode as 200 | 400 | 500)
})

// 3. Update Account
const updateAccountRoute = createRoute({
    method: 'put',
    path: '/:id',
    summary: 'Memperbarui data akun',
    request: {
        params: z.object({ id: z.string().transform(Number) }),
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        referenceNumber: z.number(),
                        accountName: z.string().min(1),
                        type: z.string().min(1),
                        role: z.string().optional(),
                        isActive: z.boolean(),
                    }),
                },
            },
        },
    },
    responses: {
        200: { content: { 'application/json': { schema: z.any() } }, description: 'Akun berhasil diperbarui' },
        400: { content: { 'application/json': { schema: z.any() } }, description: 'Validasi gagal' },
        404: { content: { 'application/json': { schema: z.any() } }, description: 'Akun tidak ditemukan' },
        500: { content: { 'application/json': { schema: z.any() } }, description: 'Error server' },
    },
})

chartOfAccountsRoutes.openapi(updateAccountRoute, async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const res = await c.get('coaService').updateAccount(c.get('userId'), id, body)
    return c.json(res, res.statusCode as 200 | 400 | 404 | 500)
})

// 4. Delete Account
const deleteAccountRoute = createRoute({
    method: 'delete',
    path: '/:id',
    summary: 'Menghapus akun jika belum memiliki transaksi jurnal',
    request: {
        params: z.object({ id: z.string().transform(Number) }),
    },
    responses: {
        200: { content: { 'application/json': { schema: z.any() } }, description: 'Akun berhasil dihapus' },
        400: { content: { 'application/json': { schema: z.any() } }, description: 'Gagal menghapus karena akun sudah digunakan dalam jurnal' },
        404: { content: { 'application/json': { schema: z.any() } }, description: 'Akun tidak ditemukan' },
        500: { content: { 'application/json': { schema: z.any() } }, description: 'Error server' },
    },
})

chartOfAccountsRoutes.openapi(deleteAccountRoute, async (c) => {
    const { id } = c.req.valid('param')
    const res = await c.get('coaService').deleteAccount(c.get('userId'), id)
    return c.json(res, res.statusCode as 200 | 400 | 404 | 500)
})