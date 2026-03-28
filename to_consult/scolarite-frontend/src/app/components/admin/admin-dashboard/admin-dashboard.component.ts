import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { KeycloakAuthService } from '../../../services/keycloak.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  isAlsoProfessor = false;

  constructor(
    private keycloakService: KeycloakAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const roles = this.keycloakService.getUserRoles();
    this.isAlsoProfessor = roles.includes('PROFESSOR');
  }

  switchToProfessorDashboard() {
    // Sauvegarder le rôle professeur comme dernier rôle utilisé
    localStorage.setItem('lastRole', 'PROFESSOR');
    this.router.navigate(['/dashboard']);
  }

  switchRole() {
    localStorage.removeItem('selectedRole');
    this.router.navigate(['/role-selector']);
  }
}