// src/app/services/submission-period.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';
import { 
  SubmissionPeriod, 
  SubmissionStatistics, 
  ExceptionPeriodRequest,
  ExceptionPeriod 
} from '../models/submission-period.models';

@Injectable({
  providedIn: 'root'
})
export class SubmissionPeriodService {
  private apiUrl = 'http://localhost:8082/api/admin/submission-periods';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        return new Observable<HttpHeaders>(observer => {
          observer.next(new HttpHeaders().set('Authorization', `Bearer ${token}`));
          observer.complete();
        });
      })
    );
  }

  // ==================== GESTION DES PÉRIODES ====================
  
  getAllPeriods(): Observable<SubmissionPeriod[]> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<SubmissionPeriod[]>(this.apiUrl, { headers }))
    );
  }

  getCurrentPeriod(): Observable<SubmissionPeriod> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<SubmissionPeriod>(`${this.apiUrl}/current`, { headers }))
    );
  }

  createPeriod(period: SubmissionPeriod): Observable<SubmissionPeriod> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<SubmissionPeriod>(this.apiUrl, period, { headers }))
    );
  }

  updatePeriod(id: number, period: SubmissionPeriod): Observable<SubmissionPeriod> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put<SubmissionPeriod>(`${this.apiUrl}/${id}`, period, { headers }))
    );
  }

  deletePeriod(id: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/${id}`, { headers }))
    );
  }

  // ==================== STATISTIQUES ====================
  
  getSubmissionStatistics(periodId: number): Observable<SubmissionStatistics> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<SubmissionStatistics>(`${this.apiUrl}/${periodId}/statistics`, { headers }))
    );
  }

  // ==================== PÉRIODES EXCEPTIONNELLES ====================
  
  grantExceptionPeriod(periodId: number, request: ExceptionPeriodRequest): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post(`${this.apiUrl}/${periodId}/exceptions`, request, { headers }))
    );
  }

  revokeExceptionPeriod(exceptionId: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/exceptions/${exceptionId}`, { headers }))
    );
  }

  getExceptionPeriods(periodId: number): Observable<ExceptionPeriod[]> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<ExceptionPeriod[]>(`${this.apiUrl}/${periodId}/exceptions`, { headers }))
    );
  }



    /**
     * Récupérer les préférences détaillées d'un professeur
     */
    getProfessorPreferences(periodId: number, professorKeycloakId: string): Observable<any> {
    return this.getHeaders().pipe(
        switchMap(headers => this.http.get(`${this.apiUrl}/${periodId}/professors/${professorKeycloakId}/preferences`, { headers }))
    );
    }

    /**
     * Récupérer toutes les préférences des professeurs pour une période
     */
    getAllProfessorsPreferences(periodId: number): Observable<any[]> {
    return this.getHeaders().pipe(
        switchMap(headers => this.http.get<any[]>(`${this.apiUrl}/${periodId}/all-preferences`, { headers }))
    );
    }

    /**
     * Mettre à jour une période exceptionnelle
     */
    updateExceptionPeriod(exceptionId: number, data: any): Observable<any> {
    return this.getHeaders().pipe(
        switchMap(headers => this.http.put(`${this.apiUrl}/exceptions/${exceptionId}`, data, { headers }))
    );
    }


}