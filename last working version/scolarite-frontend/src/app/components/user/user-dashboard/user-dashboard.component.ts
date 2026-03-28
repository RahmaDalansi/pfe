import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KeycloakAuthService } from '../../../services/keycloak.service';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  username = '';
  userRole = '';
  requiresPasswordChange = false;
  isProfessor = false;

  constructor(
    private keycloakService: KeycloakAuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  loadUserInfo() {
    this.username = this.keycloakService.getUsername();
    
    // Méthode 1: Utiliser la méthode existante (si ajoutée dans ProfileService)
    // this.userRole = this.profileService.getUserRole();
    
    // Méthode 2: Utiliser directement les rôles
    const roles = this.keycloakService.getUserRoles();
    
    // Déterminer le rôle principal
    if (roles.includes('PROFESSOR')) {
      this.userRole = 'PROFESSOR';
      this.isProfessor = true;
    } else if (roles.includes('ADMIN')) {
      this.userRole = 'ADMIN';
    } else if (roles.includes('STUDENT')) {
      this.userRole = 'STUDENT';
    } else {
      this.userRole = roles.length > 0 ? roles[0] : 'USER';
    }
    
    this.requiresPasswordChange = this.keycloakService.hasRequiredAction();
  }

  changePassword() {
    window.location.href = 'http://localhost:8081/realms/scolarite/account/password';
  }

  logout() {
    this.keycloakService.logout();
  }
}