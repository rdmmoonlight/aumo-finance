// src/routes/auth.tsx (atau src/routes/auth/route.tsx)
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth')({
  // Jika user mengakses '/auth' tanpa sub-path, langsung lempar ke '/auth/login'
  beforeLoad: ({ location }) => {
    if (location.pathname === '/auth' || location.pathname === '/auth/') {
      throw redirect({
        to: '/auth/login',
        replace: true,
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout(): React.JSX.Element {
  return <Outlet />;
}