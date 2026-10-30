import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/general-ledgers/')({
    beforeLoad: () => {
        throw redirect({
            to: '/reports/general-ledgers/permanent',
            replace: true,
        });
    },
});