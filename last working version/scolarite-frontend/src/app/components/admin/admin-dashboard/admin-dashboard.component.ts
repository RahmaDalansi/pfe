// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KeycloakAuthService } from '../../../services/keycloak.service';
import { UserManagementService } from '../../../services/user-management.service';
import { AdminValidationService } from '../../../services/admin-validation.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  adminName = '';
  adminEmail = '';
  
  stats = {
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    pendingValidations: 0
  };

  constructor(
    private keycloakService: KeycloakAuthService,
    private userManagementService: UserManagementService,
    private adminValidationService: AdminValidationService
  ) {}

  ngOnInit() {
    this.loadAdminInfo();
    this.loadStats();
  }

  loadAdminInfo() {
    this.adminName = this.keycloakService.getUsername();
    this.adminEmail = this.keycloakService.getEmail();
  }

  loadStats() {
    // Charger tous les utilisateurs
    this.userManagementService.getAllUsers('ALL', '').subscribe({
      next: (users) => {
        this.stats.totalUsers = users.length;
        this.stats.totalTeachers = users.filter(u => u.roles.includes('PROFESSOR')).length;
        this.stats.totalStudents = users.filter(u => u.roles.includes('STUDENT')).length;
      },
      error: (error) => {
        console.error('Erreur chargement stats utilisateurs:', error);
      }
    });

    // Charger les validations en attente
    this.adminValidationService.getPendingUsers().subscribe({
      next: (pendingUsers) => {
        this.stats.pendingValidations = pendingUsers.length;
      },
      error: (error) => {
        console.error('Erreur chargement stats validations:', error);
      }
    });
  }
}