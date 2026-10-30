import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/journals/')({
    beforeLoad: () => {
        throw redirect({
            to: '/reports/journals/general',
            replace: true,
        });
    },
});