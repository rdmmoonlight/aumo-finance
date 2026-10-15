import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  income?: number;
  expense?: number;
  status?: "active" | "closed" | string;
  isSelected?: boolean;
}

export interface OpenPeriodInfo {
  hasOpenPeriod: boolean;
  period?: Period;
}

export interface CreatePeriodDto {
  name: string;
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: "root",
})
export class PeriodsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = "/api/periods";

  // GET /periods
  getPeriods(): Observable<Period[]> {
    return this.http.get<Period[]>(this.baseUrl);
  }

  // GET /periods/open-info
  getOpenPeriodInfo(): Observable<OpenPeriodInfo> {
    return this.http.get<OpenPeriodInfo>(`${this.baseUrl}/open-info`);
  }

  // POST /periods
  createPeriod(dto: CreatePeriodDto): Observable<Period> {
    return this.http.post<Period>(this.baseUrl, dto);
  }

  // POST /periods/{id}/select
  selectPeriod(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/select`, {});
  }

  // POST /periods/clear-selection
  clearSelection(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/clear-selection`, {});
  }

  // POST /periods/{id}/close
  closePeriod(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/close`, {});
  }
}
