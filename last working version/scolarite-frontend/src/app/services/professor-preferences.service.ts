// src/app/services/professor-preferences.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';

export interface TimeSlotDetail {
  status: 'PREFERRED' | 'AVAILABLE' | 'UNAVAILABLE';
  reason?: string;
  reasonType?: string;
}

export interface DailyPreferencesDetail {
  day: string;
  dayLabel: string;
  morning: TimeSlotDetail;
  afternoon: TimeSlotDetail;
  evening: TimeSlotDetail;
}

export interface ProfessorPreferencesDetail {
  professorKeycloakId: string;
  professorName: string;
  professorFirstName: string;
  professorLastName: string;
  professorEmail: string;
  submissionStatus: 'SUBMITTED' | 'NOT_SUBMITTED' | 'EXCEPTION_GRANTED';
  submittedAt?: Date;
  hasExceptionPeriod: boolean;
  dailyPreferences: DailyPreferencesDetail[];
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  globalNotes: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfessorPreferencesService {
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

  /**
   * Récupérer les préférences détaillées d'un professeur
   */
  getProfessorPreferences(periodId: number, professorKeycloakId: string): Observable<ProfessorPreferencesDetail> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get<ProfessorPreferencesDetail>(
          `${this.apiUrl}/${periodId}/professors/${professorKeycloakId}/preferences`, 
          { headers }
        )
      )
    );
  }

  /**
   * Récupérer toutes les préférences des professeurs pour une période
   */
  getAllProfessorsPreferences(periodId: number): Observable<ProfessorPreferencesDetail[]> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get<ProfessorPreferencesDetail[]>(
          `${this.apiUrl}/${periodId}/all-preferences`, 
          { headers }
        )
      )
    );
  }

  /**
   * Mettre à jour une période exceptionnelle
   */
  updateExceptionPeriod(exceptionId: number, data: { startDate: Date; endDate: Date; reason: string }): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.put(`${this.apiUrl}/exceptions/${exceptionId}`, data, { headers })
      )
    );
  }

  /**
   * Récupérer toutes les périodes exceptionnelles d'une période
   */
  getExceptionPeriods(periodId: number): Observable<any[]> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get<any[]>(`${this.apiUrl}/${periodId}/exceptions`, { headers })
      )
    );
  }
}