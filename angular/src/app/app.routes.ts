import { Routes } from '@angular/router';
import { ComingSoonComponent } from './core/components/coming-soon';
import { createHealthRoute } from './core/components/health-tester';
import { MainLayoutComponent } from './core/layouts/main-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'health', pathMatch: 'full' },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // Health & System Status
      { path: 'health', ...createHealthRoute('Health: Root', '/') },
      { path: 'health/head', ...createHealthRoute('Health: Ping (HEAD)', '/', 'HEAD') },
      { path: 'health/status', ...createHealthRoute('Health: Database', '/health') },

      // Auth (Lengkap sesuai OpenAPI Hono)
      {
        path: 'auth/register',
        ...createHealthRoute('Auth: Register', '/auth/register', 'POST', {
          name: '',
          email: '',
          password: '',
          clientType: 'web'
        })
      },
      {
        path: 'auth/check-email',
        ...createHealthRoute('Auth: Check Email', '/auth/check-email?email=test@example.com')
      },
      {
        path: 'auth/login',
        ...createHealthRoute('Auth: Login', '/auth/login', 'POST', {
          email: '',
          password: '',
          clientType: 'web'
        })
      },
      { path: 'auth/logout', ...createHealthRoute('Auth: Logout', '/auth/logout', 'POST') },
      { path: 'auth/me', ...createHealthRoute('Auth: Me', '/auth/me') },
      {
        path: 'auth/change-password',
        ...createHealthRoute('Auth: Change Password', '/auth/change-password', 'POST', {
          currentPassword: '',
          newPassword: ''
        })
      },

      // Auth Sessions Management
      { path: 'auth/sessions', ...createHealthRoute('Auth: List Active Sessions', '/auth/sessions') },
      {
        path: 'auth/sessions/revoke-others',
        ...createHealthRoute('Auth: Revoke Other Sessions', '/auth/sessions', 'DELETE')
      },
      {
        path: 'auth/sessions/revoke-one',
        ...createHealthRoute('Auth: Revoke Session by ID (id=sample)', '/auth/sessions/sample-session-id', 'DELETE')
      },

      // Periods
      { path: 'periods', component: ComingSoonComponent },
      { path: 'periods/open-info', component: ComingSoonComponent },
      { path: 'periods/create', component: ComingSoonComponent },
      { path: 'periods/select', component: ComingSoonComponent },
      { path: 'periods/unselect', component: ComingSoonComponent },
      { path: 'periods/close', component: ComingSoonComponent },

      // Avatars
      { path: 'avatars', component: ComingSoonComponent },

      // Dokumentasi
      { path: 'docs/openapi', ...createHealthRoute('OpenAPI Spec', '/openapi.json') },
    ]
  },
  { path: '**', redirectTo: 'health' }
];