import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakAuthService } from '../../../services/keycloak.service';
import { StandardProfileComponent } from '../standard/standard-profile.component';
import { ProfessorProfileComponent } from '../professor/professor-profile.component';

@Component({
  selector: 'app-smart-profile',
  standalone: true,
  imports: [CommonModule, StandardProfileComponent, ProfessorProfileComponent],
  template: `
    <div class="smart-profile-container">
      @if (isLoading) {
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Chargement du profil...</p>
        </div>
      } @else {
        @if (showProfessorProfile) {
          <app-professor-profile></app-professor-profile>
        } @else {
          <app-standard-profile></app-standard-profile>
        }
      }
    </div>
  `,
  styles: [`
    .smart-profile-container {
      min-height: 100vh;
      background: #f8fafc;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 1rem;
    }
    
    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 3px solid #e2e8f0;
      border-top-color: #4361ee;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .loading-state p {
      color: #64748b;
      font-size: 0.875rem;
    }
  `]
})
export class SmartProfileComponent implements OnInit {
  showProfessorProfile = false;
  isLoading = true;

  constructor(private keycloakService: KeycloakAuthService) {}

  ngOnInit() {
    this.determineProfileType();
  }

  determineProfileType() {
    try {
      const roles = this.keycloakService.getUserRoles();
      console.log('🔍 SmartProfile - Rôles détectés:', roles);
      console.log('🔍 SmartProfile - Contient PROFESSOR?', roles.includes('PROFESSOR'));
      
      // Vérification plus robuste
      const hasProfessorRole = roles.some(role => role === 'PROFESSOR');
      this.showProfessorProfile = hasProfessorRole;
      
      console.log('🔍 SmartProfile - showProfessorProfile =', this.showProfessorProfile);
    } catch (error) {
      console.error('Erreur lors de la détermination du type de profil:', error);
      this.showProfessorProfile = false;
    } finally {
      // Petit délai pour éviter un flash
      setTimeout(() => {
        this.isLoading = false;
      }, 100);
    }
  }
}