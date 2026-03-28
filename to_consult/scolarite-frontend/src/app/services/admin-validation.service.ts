import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';

export interface PendingUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  cin?: string;
  createdTimestamp: Date;
  requestedRole: string;
}

export interface ValidationResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminValidationService {
  private apiUrl = 'http://localhost:8082/api/admin/validation';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  // CORRECTION: Retourne Observable directement en utilisant switchMap
  getPendingUsers(): Observable<PendingUser[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<PendingUser[]>(`${this.apiUrl}/pending`, { headers });
      })
    );
  }

  approveUser(userId: string, roles: string[]): Observable<ValidationResponse> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<ValidationResponse>(
          `${this.apiUrl}/approve`,
          { userId, roles },
          { headers }
        );
      })
    );
  }

  rejectUser(userId: string, reason: string): Observable<ValidationResponse> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<ValidationResponse>(
          `${this.apiUrl}/reject`,
          { userId, rejectionReason: reason },
          { headers }
        );
      })
    );
  }

  getAvailableRoles(): Observable<string[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<string[]>(`${this.apiUrl}/roles`, { headers });
      })
    );
  }
}