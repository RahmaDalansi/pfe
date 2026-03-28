// admin-professor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';
import { Professor, Subject } from './professor.service';

// ✅ DÉFINIR L'INTERFACE ICI
export interface ProfessorPreferences {
  professorId: string;
  professorName: string;
  email: string;
  preferredDays: string[];
  unavailableDays: string[];
  preferredTimeSlots: string[];
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  notes: string;
  submittedAt: Date;
  hasSubmitted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminProfessorService {
  private apiUrl = 'http://localhost:8082/api/admin/professors';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  getAllProfessors(): Observable<Professor[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Professor[]>(this.apiUrl, { headers });
      })
    );
  }

  getProfessorSubjects(keycloakId: string): Observable<Subject[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Subject[]>(`${this.apiUrl}/${keycloakId}/subjects`, { headers });
      })
    );
  }

  assignSubject(keycloakId: string, subjectId: number, isPrimary: boolean = false): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        let params = new HttpParams().set('isPrimary', isPrimary.toString());
        return this.http.post(`${this.apiUrl}/${keycloakId}/subjects/${subjectId}`, {}, { headers, params });
      })
    );
  }

  removeSubject(keycloakId: string, subjectId: number): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.apiUrl}/${keycloakId}/subjects/${subjectId}`, { headers });
      })
    );
  }

  // ✅ UTILISER L'INTERFACE DÉFINIE CI-DESSUS
  getAllProfessorsPreferences(): Observable<ProfessorPreferences[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<ProfessorPreferences[]>(`${this.apiUrl}/preferences`, { headers });
      })
    );
  }
}