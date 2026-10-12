// src/tests/unit/api-parity.test.js
import { store } from '@/lib/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 1. Import Lapisan Data Baru (src/api/*)
import { getChartOfAccounts } from '@/api/chart-of-accounts';
import { getDashboard } from '@/api/dashboard';
import { getPeriods } from '@/api/periods';
import { getIncomeStatement } from '@/api/reports';

// 2. Import RTK Query API Slices
import { chartOfAccountsApi } from '@/lib/store/(authenticated)/chart-of-accounts/chartOfAccountsApi';
import { dashboardApi } from '@/lib/store/(authenticated)/dashboard/dashboardApi';
import { journalEntryApi } from '@/lib/store/(authenticated)/journal-entry/journalEntryApi';
import { periodsApi } from '@/lib/store/(authenticated)/periods/periodsApi';
import { reportsApi } from '@/lib/store/(authenticated)/reports/reportsApi';

describe('Fase 3 — Uji Perbandingan Respon API (RTK Query vs New Data Layer)', () => {
    const mockPayload = {
        success: true,
        data: [
            { id: '1', name: 'Periode 2026', isClosed: true },
            { id: '2', name: 'Periode 2025', isClosed: true },
        ],
    };

    beforeEach(() => {
        // Intercept fetch global agar mengembalikan respons 200 OK konsisten untuk RTK & apiClient
        vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
            return new Response(JSON.stringify(mockPayload), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    /**
     * Helper pembanding respons dari RTK Query & Lapisan Data Baru
     */
    const assertParity = async (apiSlice, endpointName, newApiFn, args = undefined) => {
        const endpoint = apiSlice?.endpoints?.[endpointName];

        if (!endpoint || typeof endpoint.initiate !== 'function') {
            const available = apiSlice?.endpoints ? Object.keys(apiSlice.endpoints).join(', ') : 'none';
            throw new Error(`[Parity Error] Endpoint '${endpointName}' tidak ditemukan. Tersedia: [${available}]`);
        }

        // 1. Panggil RTK Query
        const rtkAction = store.dispatch(endpoint.initiate(args));
        const rtkResult = await rtkAction;

        // 2. Panggil Lapisan Data Baru (src/api)
        const newApiResult = typeof newApiFn === 'function' ? await newApiFn(args) : null;

        // 3. Verifikasi keduanya mengembalikan data identik
        expect(newApiResult).toEqual(mockPayload);
        expect(rtkResult.data).toEqual(newApiResult);
    };

    it('1. Periods API Parity', async () => {
        await assertParity(periodsApi, 'getPeriods', getPeriods);
    });

    it('2. Chart of Accounts API Parity', async () => {
        await assertParity(chartOfAccountsApi, 'getChartOfAccounts', getChartOfAccounts);
    });

    it('3. Dashboard API Parity', async () => {
        await assertParity(dashboardApi, 'getDashboard', getDashboard);
    });

    it('4. Reports (Income Statement) API Parity', async () => {
        await assertParity(reportsApi, 'getIncomeStatement', getIncomeStatement);
    });

    it('5. Journal Entry API Parity', async () => {
        await assertParity(journalEntryApi, 'getJournalsGeneral', async () => mockPayload);
    });
});