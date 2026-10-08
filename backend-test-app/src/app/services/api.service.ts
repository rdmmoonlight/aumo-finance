import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    // Ganti URL ini dengan URL backend kamu (misal: http://localhost:8080/api/health)
    private apiUrl = 'https://aumoapi.onrender.com';

    constructor(private http: HttpClient) { }

    checkHealth(): Observable<any> {
        return this.http.get(this.apiUrl, { observe: 'response' });
    }
}