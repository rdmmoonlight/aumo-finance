import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { GeneralJournalService } from '../services/general-journal'

export const generalJournalRoutes = new OpenAPIHono<{
    Variables: {
        generalJournalService: GeneralJournalService
        userId: string
    }
}>()

// Schema re-usable untuk line items
const JournalEntryLineSchema = z.object({
    accountId: z.number().openapi({ example: 1 }),
    lineDescription: z.string().nullable().optional().openapi({ example: 'Pembelian Kas' }),
    debit: z.number().openapi({ example: 500000 }),
    credit: z.number().openapi({ example: 0 }),
})

// 1. Get Next Transaction Number
const getNextTransactionNumberRoute = createRoute({
    method: 'get',
    path: '/next-number',
    summary: 'Mendapatkan / mengintip nomor transaksi berikutnya',
    request: {
        query: z.object({
            journalType: z.string().optional().default('General'),
            entryDate: z.string().optional(),
        }),
    },
    responses: {
        200: { content: { 'application/json': { schema: z.object({ transactionNumber: z.string() }) } }, description: 'Nomor transaksi berikutnya' },
    },
})

generalJournalRoutes.openapi(getNextTransactionNumberRoute, async (c) => {
    const { journalType, entryDate } = c.req.valid('query')
    const dateObj = entryDate ? new Date(entryDate) : new Date()
    const transactionNumber = await c.get('generalJournalService').getNextTransactionNumber(
        c.get('userId'),
        journalType ?? 'General',
        dateObj
    )
    return c.json({ transactionNumber }, 200)
})

// 2. Search Line Descriptions
const searchDescriptionsRoute = createRoute({
    method: 'get',
    path: '/descriptions',
    summary: 'Mencari autocomplete deskripsi baris jurnal',
    request: {
        query: z.object({
            q: z.string().openapi({ example: 'Pembelian' }),
        }),
    },
    responses: {
        200: { content: { 'application/json': { schema: z.array(z.string()) } }, description: 'Daftar saran deskripsi' },
    },
})

generalJournalRoutes.openapi(searchDescriptionsRoute, async (c) => {
    const { q } = c.req.valid('query')
    const results = await c.get('generalJournalService').searchDescriptions(c.get('userId'), q)
    return c.json(results, 200)
})

// 3. Get Journal Entry By ID
const getJournalByIdRoute = createRoute({
    method: 'get',
    path: '/:id',
    summary: 'Mendapatkan entri jurnal berdasarkan ID baris',
    request: {
        params: z.object({ id: z.string().transform(Number) }),
    },
    responses: {
        200: { content: { 'application/json': { schema: z.any() } }, description: 'Detail entri jurnal' },
        404: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Jurnal tidak ditemukan' },
    },
})

generalJournalRoutes.openapi(getJournalByIdRoute, async (c) => {
    const { id } = c.req.valid('param')
    const result = await c.get('generalJournalService').getById(c.get('userId'), id)
    if (!result) {
        return c.json({ success: false, message: 'Journal entry not found.' }, 404)
    }
    return c.json(result, 200)
})

// 4. Create Journal Entry
const createJournalRoute = createRoute({
    method: 'post',
    path: '/',
    summary: 'Membuat / memposting entri jurnal baru',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        journalType: z.string().optional().default('General'),
                        entryDate: z.string().transform((v) => new Date(v)),
                        createdAt: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
                        lines: z.array(JournalEntryLineSchema),
                    }),
                },
            },
        },
    },
    responses: {
        201: { content: { 'application/json': { schema: z.any() } }, description: 'Jurnal berhasil diposting' },
        400: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Validasi gagal / Debit-Kredit tidak seimbang / Periode terkunci' },
    },
})

generalJournalRoutes.openapi(createJournalRoute, async (c) => {
    try {
        const body = c.req.valid('json')
        const result = await c.get('generalJournalService').create(c.get('userId'), body)
        return c.json(result, 201)
    } catch (e: unknown) {
        return c.json({ success: false, message: e instanceof Error ? e.message : 'Failed to create journal entry' }, 400)
    }
})

// 5. Update Journal Entry
const updateJournalRoute = createRoute({
    method: 'put',
    path: '/:id',
    summary: 'Memperbarui entri jurnal',
    request: {
        params: z.object({ id: z.string().transform(Number) }),
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        journalType: z.string().optional(),
                        entryDate: z.string().transform((v) => new Date(v)),
                        updatedAt: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
                        lines: z.array(JournalEntryLineSchema),
                    }),
                },
            },
        },
    },
    responses: {
        200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Jurnal berhasil diperbarui' },
        400: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Validasi gagal / Jurnal dalam periode terkunci' },
    },
})

generalJournalRoutes.openapi(updateJournalRoute, async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    try {
        await c.get('generalJournalService').update(c.get('userId'), id, body)
        return c.json({ success: true, message: 'Journal entry updated successfully.' }, 200)
    } catch (e: unknown) {
        return c.json({ success: false, message: e instanceof Error ? e.message : 'Failed to update journal entry' }, 400)
    }
})

// 6. Delete Journal Entry
const deleteJournalRoute = createRoute({
    method: 'delete',
    path: '/:id',
    summary: 'Menghapus entri jurnal',
    request: {
        params: z.object({ id: z.string().transform(Number) }),
    },
    responses: {
        200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Jurnal berhasil dihapus' },
        400: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Gagal menghapus / Jurnal dalam periode terkunci' },
    },
})

generalJournalRoutes.openapi(deleteJournalRoute, async (c) => {
    const { id } = c.req.valid('param')
    try {
        await c.get('generalJournalService').delete(c.get('userId'), id)
        return c.json({ success: true, message: 'Journal entry deleted successfully.' }, 200)
    } catch (e: unknown) {
        return c.json({ success: false, message: e instanceof Error ? e.message : 'Failed to delete journal entry' }, 400)
    }
})