import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface HealthResponse {
    endpoint: string;
    method: string;
    status: number;
    statusText: string;
    responseTimeMs: number;
    body: any;
    ok: boolean;
}

@Injectable({ providedIn: 'root' })
export class HealthCheckerService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl || 'http://localhost:8080';

    /** Token Bearer opsional (disimpan di memori saja) untuk endpoint terproteksi. */
    token = '';

    testEndpoint(path: string, method: string = 'GET', body?: unknown): Observable<HealthResponse> {
        const fullUrl = `${this.baseUrl}${path}`;
        const startTime = performance.now();
        const headers: Record<string, string> = {};
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

        return this.http
            .request(method, fullUrl, {
                observe: 'response',
                withCredentials: true,
                headers,
                body: method === 'GET' || method === 'HEAD' ? undefined : body,
            })
            .pipe(
                map((res) => ({
                    endpoint: path,
                    method,
                    status: res.status,
                    statusText: res.statusText || 'OK',
                    responseTimeMs: Math.round(performance.now() - startTime),
                    body: res.body,
                    ok: true,
                })),
                catchError((err: HttpErrorResponse) =>
                    of({
                        endpoint: path,
                        method,
                        status: err.status || 0,
                        statusText: err.statusText || 'Unknown Error / CORS Issue',
                        responseTimeMs: Math.round(performance.now() - startTime),
                        body: err.error || null,
                        ok: false,
                    })
                )
            );
    }
}
