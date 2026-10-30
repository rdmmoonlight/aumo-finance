import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/trial-balances/')({
    beforeLoad: () => {
        throw redirect({
            to: '/reports/trial-balances/unadjusted',
            replace: true,
        });
    },
});