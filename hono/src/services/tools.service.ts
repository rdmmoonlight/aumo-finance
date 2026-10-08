import { and, eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { db } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import type {
    AccountMappingDetail,
    ImportJournalResult,
    JournalImportRequest,
    JournalLineDto,
    JournalTransactionDto,
    PreviewJournalImport
} from '../types/tools.type.js';

// Pengganti IToolsService / ToolsService C#

function daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

function formatYyMm(date: Date): string {
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yy}${mm}`;
}

function formatDateYmd(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export class ToolsService {
    async generateJournalTemplate(): Promise<Buffer> {
        // C# pakai ClosedXML - TS pakai exceljs
        const ExcelJS = await import('exceljs').then(m => m.default || m).catch(() => null);

        if (!ExcelJS) {
            // Fallback sederhana kalau exceljs tidak terinstall: pakai buffer kosong dengan pesan
            logger.warn('exceljs not installed, generating CSV fallback for journal template');
            // Untuk fallback, kita buat XLSX minimal via manual? pakai xlsx lib kalau ada
            try {
                const XLSX = await import('xlsx');
                const wb = XLSX.utils.book_new();
                const header = [['Date', 'Account Name', 'Description', 'Ref', 'Debit', 'Credit']];
                const ws1 = XLSX.utils.aoa_to_sheet(header);
                const ws2 = XLSX.utils.aoa_to_sheet(header);
                XLSX.utils.book_append_sheet(wb, ws1, 'GJ');
                XLSX.utils.book_append_sheet(wb, ws2, 'AJ');
                const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
                return Buffer.from(buf);
            } catch {
                // Last resort: return empty buffer, route akan handle
                return Buffer.from([]);
            }
        }

        const workbook = new ExcelJS.Workbook();

        const createSheet = (name: string) => {
            const ws = workbook.addWorksheet(name);
            ws.addRow(['Date', 'Account Name', 'Description', 'Ref', 'Debit', 'Credit']);
            const headerRow = ws.getRow(1);
            headerRow.font = { bold: true };
            headerRow.commit();
            ws.columns = [
                { width: 15 }, // Date
                { width: 30 }, // Account Name
                { width: 35 }, // Description
                { width: 10 }, // Ref
                { width: 15 }, // Debit
                { width: 15 }  // Credit
            ];
        };

        createSheet('GJ');
        createSheet('AJ');

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer as any);
    }

    async previewJournalImport(userId: string, request: JournalImportRequest): Promise<PreviewJournalImport> {
        const existingCoas = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true)
            )
        });

        const mappingDetails: AccountMappingDetail[] = [];
        const processedTransactions: JournalTransactionDto[] = [];
        const counterMemory = new Map<string, number>();

        for (const txDto of request.transactions) {
            const rawDate = new Date(txDto.date);
            if (isNaN(rawDate.getTime())) continue;

            const day = Math.min(rawDate.getDate(), daysInMonth(request.targetYear, request.targetMonth));
            const txDate = new Date(Date.UTC(request.targetYear, request.targetMonth - 1, day));

            const prefix = txDto.journalType.toLowerCase().includes('adjust') ? 'AJ' : 'GJ';
            const counterKey = `${prefix}${formatYyMm(txDate)}`;

            if (!counterMemory.has(counterKey)) {
                const existingCounter = await db.query.transactionCounters.findFirst({
                    where: and(
                        eq(schema.transactionCounters.userId, userId),
                        eq(schema.transactionCounters.counterKey, counterKey)
                    )
                });
                counterMemory.set(counterKey, existingCounter?.lastSequence || 0);
            }

            const nextSeq = (counterMemory.get(counterKey) || 0) + 1;
            counterMemory.set(counterKey, nextSeq);
            const generatedTxNumber = `${counterKey}${String(nextSeq).padStart(5, '0')}`;

            const processedLines: JournalLineDto[] = [];

            for (const lineDto of txDto.lines) {
                const refInt = lineDto.refNumber;
                const excelAccountName = (lineDto.accountName || '').trim();

                const coa = existingCoas.find(c =>
                    c.referenceNumber === refInt &&
                    c.accountName.toLowerCase() === excelAccountName.toLowerCase()
                );

                if (coa) {
                    mappingDetails.push({
                        excelRef: refInt,
                        excelAccountName,
                        mappedRef: coa.referenceNumber,
                        mappedAccountName: coa.accountName,
                        status: 'EXACT_MATCH',
                        reason: 'Nomor Ref dan Nama Akun cocok 100% presisi dengan Master COA.'
                    });
                } else {
                    mappingDetails.push({
                        excelRef: refInt,
                        excelAccountName,
                        mappedRef: 0,
                        mappedAccountName: '',
                        status: 'UNMAPPED',
                        reason: 'Silakan pilih akun pelimpahan manual dari dropdown.'
                    });
                }

                processedLines.push({
                    refNumber: refInt,
                    accountName: excelAccountName,
                    description: lineDto.description,
                    debit: lineDto.debit ?? null,
                    credit: lineDto.credit ?? null
                });
            }

            processedTransactions.push({
                transactionNumber: generatedTxNumber,
                date: formatDateYmd(txDate),
                journalType: txDto.journalType,
                lines: processedLines
            });
        }

        // Unique mappings
        const uniqueMap = new Map<string, AccountMappingDetail>();
        for (const m of mappingDetails) {
            const key = `${m.excelRef}|||${m.excelAccountName.toLowerCase()}`;
            if (!uniqueMap.has(key)) uniqueMap.set(key, m);
        }
        const uniqueMappings = Array.from(uniqueMap.values());

        const exactMatchCount = uniqueMappings.filter(m => m.status === 'EXACT_MATCH').length;
        const reallocatedCount = uniqueMappings.filter(m => m.status === 'REALLOCATED_NAME' || m.status === 'REALLOCATED_REF').length;
        const unmappedCount = uniqueMappings.filter(m => m.status === 'UNMAPPED' || m.mappedRef === 0).length;

        return {
            transactions: processedTransactions,
            accountMappings: uniqueMappings,
            summary: {
                totalUniqueAccounts: uniqueMappings.length,
                exactMatchCount,
                reallocatedCount,
                unmappedCount,
                isPerfectMatch: unmappedCount === 0
            }
        };
    }

    async importJournalEntries(userId: string, request: JournalImportRequest): Promise<ImportJournalResult> {
        return await db.transaction(async (tx) => {
            // 1. Cari atau buat period
            let period = await tx.query.periods.findFirst({
                where: and(
                    eq(schema.periods.userId, userId),
                    // Filter year/month via SQL karena drizzle tidak ada extract year/month helper, pakai query manual
                    // Untuk simplifikasi, cari period yang startDate di tahun & bulan target
                )
            });

            // Cari period dengan startDate year/month yang sama
            const allPeriods = await tx.query.periods.findMany({
                where: eq(schema.periods.userId, userId)
            });
            period = allPeriods.find(p => {
                const d = new Date(p.startDate);
                return d.getFullYear() === request.targetYear && d.getMonth() + 1 === request.targetMonth;
            });

            if (!period) {
                const monthName = new Date(request.targetYear, request.targetMonth - 1, 1)
                    .toLocaleString('id-ID', { month: 'long', year: 'numeric' });

                const startDate = new Date(Date.UTC(request.targetYear, request.targetMonth - 1, 1));
                const endDate = new Date(Date.UTC(request.targetYear, request.targetMonth - 1, daysInMonth(request.targetYear, request.targetMonth)));

                const [newPeriod] = await tx.insert(schema.periods).values({
                    userId,
                    periodName: monthName,
                    startDate,
                    endDate,
                    isClosed: false,
                    isSelected: false
                } as any).returning();
                period = newPeriod as any;
            }

            const existingCoas = await tx.query.chartOfAccounts.findMany({
                where: and(
                    eq(schema.chartOfAccounts.userId, userId),
                    eq(schema.chartOfAccounts.isActive, true)
                )
            });

            const mappingDict = new Map<string, AccountMappingDetail>();
            if (request.customMappings) {
                for (const m of request.customMappings.filter(m => m.mappedRef > 0)) {
                    const key = `${m.excelRef}|||${m.excelAccountName.trim().toLowerCase()}`;
                    mappingDict.set(key, m);
                }
            }

            const existingEntries = await tx.query.journalEntries.findMany({
                where: eq(schema.journalEntries.userId, userId),
                columns: { transactionNumber: true }
            });
            const existingTxNumbers = new Set(existingEntries.map(e => e.transactionNumber));

            const activeCounters = new Map<string, any>();
            let importedEntriesCount = 0;

            for (const txDto of request.transactions) {
                const rawDate = new Date(txDto.date);
                if (isNaN(rawDate.getTime())) continue;

                const day = Math.min(rawDate.getDate(), daysInMonth(request.targetYear, request.targetMonth));
                const txDate = new Date(Date.UTC(request.targetYear, request.targetMonth - 1, day));

                const prefix = txDto.journalType.toLowerCase().includes('adjust') ? 'AJ' : 'GJ';
                const counterKey = `${prefix}${formatYyMm(txDate)}`;

                let counter = activeCounters.get(counterKey);
                if (!counter) {
                    counter = await tx.query.transactionCounters.findFirst({
                        where: and(
                            eq(schema.transactionCounters.userId, userId),
                            eq(schema.transactionCounters.counterKey, counterKey)
                        )
                    });

                    if (!counter) {
                        const [newCounter] = await tx.insert(schema.transactionCounters).values({
                            userId,
                            counterKey,
                            lastSequence: 0
                        } as any).returning();
                        counter = newCounter;
                    }
                    activeCounters.set(counterKey, counter);
                }

                counter.lastSequence += 1;
                let transactionNumber = `${counterKey}${String(counter.lastSequence).padStart(5, '0')}`;

                while (existingTxNumbers.has(transactionNumber)) {
                    counter.lastSequence += 1;
                    transactionNumber = `${counterKey}${String(counter.lastSequence).padStart(5, '0')}`;
                }
                existingTxNumbers.add(transactionNumber);

                // Update counter di DB
                await tx.update(schema.transactionCounters)
                    .set({ lastSequence: counter.lastSequence } as any)
                    .where(eq(schema.transactionCounters.id, counter.id));

                const linesToInsert: any[] = [];

                for (const lineDto of txDto.lines) {
                    const excelRef = lineDto.refNumber;
                    const excelAccountName = (lineDto.accountName || '').trim();
                    let targetRef = excelRef;

                    const mapKey = `${excelRef}|||${excelAccountName.toLowerCase()}`;
                    const customMap = mappingDict.get(mapKey);
                    if (customMap) {
                        targetRef = customMap.mappedRef;
                    }

                    const coa = existingCoas.find(c => c.referenceNumber === targetRef);
                    if (!coa) continue;

                    linesToInsert.push({
                        // accountId akan diisi setelah journalEntry dibuat
                        _coaId: coa.id,
                        description: lineDto.description || '',
                        debit: lineDto.debit ?? 0,
                        credit: lineDto.credit ?? 0
                    });
                }

                if (linesToInsert.length > 0) {
                    const [journalEntry] = await tx.insert(schema.journalEntries).values({
                        userId,
                        transactionNumber,
                        journalType: txDto.journalType,
                        entryDate: txDate,
                        createdAt: txDate
                    } as any).returning();

                    // Insert lines
                    for (const l of linesToInsert) {
                        await tx.insert(schema.journalEntryLines).values({
                            journalEntryId: journalEntry.id,
                            accountId: l._coaId,
                            lineDescription: l.description,
                            debit: l.debit,
                            credit: l.credit
                        } as any);
                    }

                    importedEntriesCount++;
                }
            }

            logger.info({ userId, importedEntriesCount }, 'Journal import completed');

            return {
                message: 'Journal data successfully imported.',
                importedEntriesCount
            };
        });
    }
}

export const toolsService = new ToolsService();
