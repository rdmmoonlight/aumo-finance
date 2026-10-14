import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { API_URL } from './config';

export const pingGuard: CanActivateFn = () => {
    const http = inject(HttpClient);

    // Tembak GET / ke URL backend dari config env
    return http.get(`${API_URL}`).pipe(
        map(() => true),
        catchError(() => of(true)) // Tetap izinkan masuk kalau gagal/timeout
    );
};