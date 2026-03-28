import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';

export interface UserDetails {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  cin?: string;
  createdTimestamp: number;
  emailVerified: boolean;
  enabled: boolean;
  roles: string[];
  allRoles?: string[];
  requestedRole?: string;
  registrationDate?: string;
  approvedDate?: string;
  approvedBy?: string;
  attributes?: any;
    initials?: string;
  fullName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = 'http://localhost:8082/api/admin/users';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  getAllUsers(role?: string, search?: string): Observable<UserDetails[]> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        let params = new HttpParams();
        if (role && role !== 'ALL') {
          params = params.set('role', role);
        }
        if (search) {
          params = params.set('search', search);
        }
        return this.http.get<UserDetails[]>(this.apiUrl, { headers, params });
      })
    );
  }

  getUserById(userId: string): Observable<UserDetails> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<UserDetails>(`${this.apiUrl}/${userId}`, { headers });
      })
    );
  }

  updateUser(userId: string, userData: Partial<UserDetails>): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.apiUrl}/${userId}`, userData, { headers });
      })
    );
  }

  resetPassword(userId: string): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/${userId}/reset-password`, {}, { headers });
      })
    );
  }

  toggleUserStatus(userId: string): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/${userId}/toggle-status`, {}, { headers });
      })
    );
  }

  deleteUser(userId: string): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.apiUrl}/${userId}`, { headers });
      })
    );
  }

  assignRole(userId: string, roleName: string): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/${userId}/roles/${roleName}`, {}, { headers });
      })
    );
  }

  removeRole(userId: string, roleName: string): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.apiUrl}/${userId}/roles/${roleName}`, { headers });
      })
    );
  }


    bulkResetPasswords(userIds: string[]): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
        switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/bulk/reset-passwords`, 
            { userIds, confirmAction: true }, 
            { headers }
        );
        })
    );
    }

    bulkToggleStatus(userIds: string[], enable: boolean): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
        switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/bulk/toggle-status`, 
            { userIds, enable, confirmAction: true }, 
            { headers }
        );
        })
    );
    }
}