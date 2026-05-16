// classroom.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';

export interface Classroom {
  id: number;
  name: string;
  number: string;
  type: 'COURS' | 'LABO' | 'AMPHI';
  capacity: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private apiUrl = 'http://localhost:8082/api/admin/classrooms';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  getAllClassrooms(): Observable<Classroom[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Classroom[]>(this.apiUrl, { headers });
      })
    );
  }

  getActiveClassrooms(): Observable<Classroom[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Classroom[]>(`${this.apiUrl}/active`, { headers });
      })
    );
  }

  getClassroomById(id: number): Observable<Classroom> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Classroom>(`${this.apiUrl}/${id}`, { headers });
      })
    );
  }

  createClassroom(classroom: Partial<Classroom>): Observable<Classroom> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<Classroom>(this.apiUrl, classroom, { headers });
      })
    );
  }

  updateClassroom(id: number, classroom: Partial<Classroom>): Observable<Classroom> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put<Classroom>(`${this.apiUrl}/${id}`, classroom, { headers });
      })
    );
  }

  // ✅ SOFT DELETE - Désactiver
  deactivateClassroom(id: number): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.apiUrl}/${id}/deactivate`, {}, { headers });
      })
    );
  }

  // ✅ SOFT DELETE - Réactiver
  activateClassroom(id: number): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.apiUrl}/${id}/activate`, {}, { headers });
      })
    );
  }

  // ✅ HARD DELETE - Suppression définitive
  hardDeleteClassroom(id: number): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
      })
    );
  }
}