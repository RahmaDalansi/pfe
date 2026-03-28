import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';
import { Subject } from './professor.service';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = 'http://localhost:8082/api/admin/subjects';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  getAllSubjects(activeOnly: boolean = false): Observable<Subject[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        let params = new HttpParams();
        if (activeOnly) {
          params = params.set('activeOnly', 'true');
        }
        return this.http.get<Subject[]>(this.apiUrl, { headers, params });
      })
    );
  }

  getSubjectById(id: number): Observable<Subject> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Subject>(`${this.apiUrl}/${id}`, { headers });
      })
    );
  }

  createSubject(subject: Subject): Observable<Subject> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<Subject>(this.apiUrl, subject, { headers });
      })
    );
  }

  updateSubject(id: number, subject: Subject): Observable<Subject> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put<Subject>(`${this.apiUrl}/${id}`, subject, { headers });
      })
    );
  }

  deleteSubject(id: number): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
      })
    );
  }

  getSubjectsBySemester(semester: number): Observable<Subject[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Subject[]>(`${this.apiUrl}/semester/${semester}`, { headers });
      })
    );
  }
}