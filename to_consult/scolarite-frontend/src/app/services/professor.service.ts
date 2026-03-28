import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';

export interface Professor {
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  specialite?: string;
  bureau?: string;
  telephone?: string;
  dateEmbauche?: Date;
  subjects: Subject[];
  hasSubmittedPreferences: boolean;
  preferencesSubmittedAt?: Date; // ✅ Ajouter cette propriété
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  description: string;
  weeklyHours: number;
  semester: number;
  credits: number;
  isActive: boolean;
  isAssignedToCurrentProfessor?: boolean;
}

export interface TeachingPreferences {
  id?: number;
  professorId: number; // ✅ Rendre obligatoire
  submissionPeriodId?: number;
  submittedAt?: Date;
  isSubmitted: boolean;
  preferredDays: string[];
  unavailableDays: string[];
  preferredTimeSlots: string[];
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  notes: string;
  constraints?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private apiUrl = 'http://localhost:8082/api/professor';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  getProfile(): Observable<Professor> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Professor>(`${this.apiUrl}/profile`, { headers });
      })
    );
  }

  updateProfile(profile: Partial<Professor>): Observable<Professor> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put<Professor>(`${this.apiUrl}/profile`, profile, { headers });
      })
    );
  }

  getSubmissionPeriodStatus(): Observable<{ isOpen: boolean }> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<{ isOpen: boolean }>(`${this.apiUrl}/submission-period/status`, { headers });
      })
    );
  }

  getPreferences(): Observable<TeachingPreferences> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<TeachingPreferences>(`${this.apiUrl}/preferences`, { headers });
      })
    );
  }

  savePreferences(preferences: TeachingPreferences): Observable<TeachingPreferences> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<TeachingPreferences>(`${this.apiUrl}/preferences`, preferences, { headers });
      })
    );
  }
}