import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private apiUrl = 'http://localhost:8082/api';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  importStudents(file: File): Observable<HttpEvent<any>> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const formData = new FormData();
        formData.append('file', file);
        
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        
        return this.http.post(`${this.apiUrl}/admin/import/students`, formData, {
          headers,
          reportProgress: true,
          observe: 'events'
        });
      })
    );
  }

  importProfessors(file: File): Observable<HttpEvent<any>> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const formData = new FormData();
        formData.append('file', file);
        
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        
        return this.http.post(`${this.apiUrl}/admin/import/professors`, formData, {
          headers,
          reportProgress: true,
          observe: 'events'
        });
      })
    );
  }
}