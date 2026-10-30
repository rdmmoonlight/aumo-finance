import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth')({
  beforeLoad: () => {
    throw redirect({
      to: '/auth/login',
      replace: true, // Mengganti history entry agar tombol back browser berjalan normal
    });
  },
});