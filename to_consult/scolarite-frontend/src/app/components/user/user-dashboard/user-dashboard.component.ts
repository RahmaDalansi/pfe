import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router} from '@angular/router';
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
  
  // Indicateur pour savoir si l'utilisateur est professeur
  isProfessor = false;
  isAlsoAdmin = false;

  constructor(
    private keycloakService: KeycloakAuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = this.keycloakService.getUsername();
    this.userRole = this.profileService.getUserRole();
    this.isProfessor = this.userRole === 'PROFESSOR';
    const roles = this.keycloakService.getUserRoles();
    this.isAlsoAdmin = roles.includes('ADMIN');
    this.requiresPasswordChange = this.keycloakService.hasRequiredAction();
  }

  changePassword() {
    window.location.href = 'http://localhost:8081/realms/scolarite/account/password';
  }

  logout() {
    this.keycloakService.logout();
  }

  switchToAdminDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  switchRole() {
    localStorage.removeItem('selectedRole');
    this.router.navigate(['/role-selector']);
  }
}