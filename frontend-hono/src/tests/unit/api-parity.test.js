// src/tests/unit/api-parity.test.js
import { getPeriods } from '@/api/periods';
import { store } from '@/lib/store';
import { periodsApi } from '@/lib/store/(authenticated)/periods/periodsApi';
import { describe, expect, it } from 'vitest';

describe('Uji Perbandingan Respon API (RTK Query vs New Data Layer)', () => {
    it('harus menghasilkan data periode yang identik', async () => {
        // 1. Panggil melalui RTK Query lama
        const rtkAction = store.dispatch(periodsApi.endpoints.getPeriods.initiate());
        const rtkResult = await rtkAction;

        // 2. Panggil melalui lapisan API baru
        const newApiResult = await getPeriods();

        // 3. Verifikasi struktur & isi data
        expect(newApiResult).toEqual(rtkResult.data);
    });
});