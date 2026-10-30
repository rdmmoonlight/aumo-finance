import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/financial-statements/')({
    beforeLoad: () => {
        throw redirect({
            to: '/reports/financial-statements/income-statement',
            replace: true,
        });
    },
});