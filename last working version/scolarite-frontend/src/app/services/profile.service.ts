import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap, of, catchError } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';

export interface Profile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  cin: string;
  roles: string[];
  createdTimestamp: number;
  enabled: boolean;
}

export interface ProfessorExtendedProfile extends Profile {
  specialite?: string;
  bureau?: string;
  telephone?: string;
  dateEmbauche?: Date;
  subjects?: Subject[];
  hasSubmittedPreferences?: boolean;
  preferencesSubmittedAt?: Date;
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
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8082/api/profile';
  private professorApiUrl = 'http://localhost:8082/api/professor';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        return of(new HttpHeaders().set('Authorization', `Bearer ${token}`));
      })
    );
  }

  // Profil commun
  getProfile(): Observable<Profile> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<Profile>(this.apiUrl, { headers }))
    );
  }

  // Profil professeur étendu
  getProfessorExtendedProfile(): Observable<ProfessorExtendedProfile | null> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<ProfessorExtendedProfile>(`${this.professorApiUrl}/profile`, { headers })),
      catchError((error) => {
        if (error.status === 404) {
          return of(null);
        }
        throw error;
      })
    );
  }

  // Mise à jour du profil commun
  updateProfile(profile: Partial<Profile>): Observable<ApiResponse> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put<ApiResponse>(this.apiUrl, profile, { headers }))
    );
  }

  // Mise à jour des informations professeur
  updateProfessorInfo(info: Partial<ProfessorExtendedProfile>): Observable<ProfessorExtendedProfile> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put<ProfessorExtendedProfile>(`${this.professorApiUrl}/profile`, info, { headers }))
    );
  }

  // Changement de mot de passe
  changePassword(passwordData: PasswordChange): Observable<ApiResponse> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<ApiResponse>(`${this.apiUrl}/change-password`, passwordData, { headers }))
    );
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    return this.keycloakService.getUserRoles().includes(role);
  }

  // Obtenir tous les rôles
  getUserRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }

 getUserRole(): string {
    const roles = this.keycloakService.getUserRoles();
    
    // Retourner le rôle principal avec priorité
    if (roles.includes('PROFESSOR')) return 'PROFESSOR';
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('STUDENT')) return 'STUDENT';
    
    return roles.length > 0 ? roles[0] : 'USER';
  }

}