import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.middleware'
import * as journalEntryService from '../services/journal-entry.service'

const journalEntryRoute = new Hono()

// Contoh GET: Ambil daftar jurnal
journalEntryRoute.get('/', authMiddleware, async (c) => {
    const result = await journalEntryService.getAllJournalEntries()
    return c.json({ success: true, data: result }, 200)
})

// Contoh POST: Buat jurnal baru
journalEntryRoute.post('/', authMiddleware, async (c) => {
    const body = await c.req.json()
    const newEntry = await journalEntryService.createJournalEntry(body)
    return c.json({ success: true, data: newEntry }, 201)
})

export default journalEntryRoute