import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';

export interface SubmissionPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  isActive: boolean;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubmissionPeriodService {
  private apiUrl = 'http://localhost:8082/api/admin/submission-periods';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  getAllPeriods(): Observable<SubmissionPeriod[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<SubmissionPeriod[]>(this.apiUrl, { headers });
      })
    );
  }

  getActivePeriods(): Observable<SubmissionPeriod[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<SubmissionPeriod[]>(`${this.apiUrl}/active`, { headers });
      })
    );
  }

  getCurrentPeriod(): Observable<SubmissionPeriod> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<SubmissionPeriod>(`${this.apiUrl}/current`, { headers });
      })
    );
  }

  createPeriod(period: SubmissionPeriod): Observable<SubmissionPeriod> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<SubmissionPeriod>(this.apiUrl, period, { headers });
      })
    );
  }

  updatePeriod(id: number, period: SubmissionPeriod): Observable<SubmissionPeriod> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put<SubmissionPeriod>(`${this.apiUrl}/${id}`, period, { headers });
      })
    );
  }

  deletePeriod(id: number): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
      })
    );
  }

  getStatus(): Observable<{ isOpen: boolean; currentPeriod?: SubmissionPeriod }> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<{ isOpen: boolean; currentPeriod?: SubmissionPeriod }>(`${this.apiUrl}/status`, { headers });
      })
    );
  }
}