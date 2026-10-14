import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

export const pingGuard: CanActivateFn = () => {
    const http = inject(HttpClient);

    // Tembak endpoint ping / backend
    return http.get('/').pipe(
        map(() => true),
        catchError(() => of(true)) // Tetap izinkan masuk kalau gagal
    );
};