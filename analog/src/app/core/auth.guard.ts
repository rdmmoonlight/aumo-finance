import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of } from 'rxjs';

import { AuthService } from './auth.service';

/** Halaman yang wajib login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Jika data user sudah ada di signal/state, langsung izinkan
  if (auth.user()) return true;

  // 2. Jika tidak ada token simpanan, langsung lempar ke login tanpa hit API
  if (!auth.hasToken()) return router.parseUrl('/login');

  // 3. Hanya hit API /auth/me jika ada token
  return auth.loadSession().pipe(map((ok) => (ok ? true : router.parseUrl('/login'))));
};

/** Halaman khusus tamu (login/register); user yang sudah login diarahkan ke /home. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Jika user sudah terverifikasi login, lempar ke /home
  if (auth.user()) return of(router.parseUrl('/home'));

  // 2. Jika tidak ada token simpanan, pasti tamu -> langsung izinkan tanpa hit API
  if (!auth.hasToken()) return of(true);

  // 3. Jika ada token simpanan, pastikan sesi valid dulu
  return auth.loadSession().pipe(map((ok) => (ok ? router.parseUrl('/home') : true)));
};