import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
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
  // Infos spécifiques aux professeurs (locales)
  specialite?: string;
  bureau?: string;
  telephone?: string;
  dateEmbauche?: Date;
  subjects?: any[];
  hasSubmittedPreferences?: boolean;
  preferencesSubmittedAt?: Date; // ✅ Ajouter cette propriété
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
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

  // Profil commun (tous les utilisateurs)
  getProfile(): Observable<Profile> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Profile>(this.apiUrl, { headers });
      })
    );
  }

  // Profil étendu pour les professeurs
  getProfessorExtendedProfile(): Observable<ProfessorExtendedProfile> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<ProfessorExtendedProfile>(`${this.professorApiUrl}/profile`, { headers });
      })
    );
  }

  updateProfile(profile: Partial<Profile>): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(this.apiUrl, profile, { headers });
      })
    );
  }

  // Mise à jour des infos professeur
  updateProfessorInfo(info: Partial<ProfessorExtendedProfile>): Observable<ProfessorExtendedProfile> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put<ProfessorExtendedProfile>(`${this.professorApiUrl}/profile`, info, { headers });
      })
    );
  }

  changePassword(passwordData: PasswordChange): Observable<any> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/change-password`, passwordData, { headers });
      })
    );
  }

  getUserRole(): string {
    const roles = this.keycloakService.getUserRoles();
    if (roles.includes('PROFESSOR')) return 'PROFESSOR';
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('STUDENT')) return 'STUDENT';
    return 'USER';
  }
}