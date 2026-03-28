import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakAuthService } from '../../services/keycloak.service';
import { ProfessorService, Professor } from '../../services/professor.service';

@Component({
  selector: 'app-keycloak-debug',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './keycloak-debug.component.html',
  styleUrls: ['./keycloak-debug.component.css']
})
export class KeycloakDebugComponent implements OnInit {
  tokenInfo: any = null;
  userRoles: string[] = [];
  username = '';
  isLoggedIn = false;
  testResult: any = null;
  professorProfile: any = null;
  isTesting = false;
  isLoadingProfile = false;

  constructor(
    private keycloakService: KeycloakAuthService,
    private professorService: ProfessorService
  ) {}

  async ngOnInit() {
    await this.debugToken();
    await this.testProfessorEndpoint();
    await this.loadProfessorProfile();
  }

  async debugToken() {
    try {
      const token = await this.keycloakService.getToken();
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        this.tokenInfo = {
          username: payload.preferred_username,
          email: payload.email,
          roles: payload.realm_access?.roles || [],
          exp: new Date(payload.exp * 1000).toLocaleString(),
          sub: payload.sub
        };
        this.userRoles = payload.realm_access?.roles || [];
        this.username = payload.preferred_username || '';
        this.isLoggedIn = true;
        
        console.log('=== DÉBOGAGE TOKEN ===');
        console.log('Utilisateur:', this.username);
        console.log('Rôles:', this.userRoles);
        console.log('Expiration:', this.tokenInfo.exp);
        console.log('Has PROFESSOR role:', this.userRoles.includes('PROFESSOR'));
      }
    } catch (error) {
      console.error('Erreur décodage token:', error);
    }
  }

  isTokenExpiringSoon(): boolean {
    if (!this.tokenInfo?.exp) return false;
    const expDate = new Date(this.tokenInfo.exp);
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();
    const diffMin = diffMs / (1000 * 60);
    return diffMin < 5;
  }

  testProfessorEndpoint() {
    this.isTesting = true;
    this.professorService.testEndpoint().subscribe({
      next: (response) => {
        console.log('✅ Test réussi:', response);
        this.testResult = {
          success: true,
          data: response,
          status: 200
        };
        this.isTesting = false;
      },
      error: (error) => {
        console.error('❌ Test échoué:', error);
        this.testResult = {
          success: false,
          message: error.error?.message || error.message || 'Erreur inconnue',
          status: error.status
        };
        this.isTesting = false;
      }
    });
  }

  loadProfessorProfile() {
    this.isLoadingProfile = true;
    this.professorService.getProfile().subscribe({
      next: (profile) => {
        console.log('✅ Profil chargé:', profile);
        this.professorProfile = profile;
        this.isLoadingProfile = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement profil:', error);
        this.professorProfile = {
          error: true,
          message: error.error?.message || error.message || 'Erreur inconnue',
          status: error.status
        };
        this.isLoadingProfile = false;
      }
    });
  }

  refreshAll() {
    this.debugToken();
    this.testProfessorEndpoint();
    this.loadProfessorProfile();
  }

  clearLogs() {
    console.clear();
    console.log('=== CONSOLE EFFACÉE ===');
  }
}