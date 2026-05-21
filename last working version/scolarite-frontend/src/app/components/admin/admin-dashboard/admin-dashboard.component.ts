// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KeycloakAuthService } from '../../../services/keycloak.service';
import { UserManagementService } from '../../../services/user-management.service';
import { AdminValidationService } from '../../../services/admin-validation.service';
import { SubmissionPeriodService } from '../../../services/submission-period.service';
import { SubmissionPeriod } from '../../../models/submission-period.models';
import { SubmissionStatisticsComponent } from '../submission-statistics/submission-statistics.component';
import { ExceptionPeriodComponent } from '../exception-period/exception-period.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    SubmissionStatisticsComponent,
    ExceptionPeriodComponent
  ],
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

  // Propriétés pour la gestion des périodes
  periods: SubmissionPeriod[] = [];
  selectedPeriodId: number | null = null;
  selectedPeriodName: string = '';

  constructor(
    private keycloakService: KeycloakAuthService,
    private userManagementService: UserManagementService,
    private adminValidationService: AdminValidationService,
    private periodService: SubmissionPeriodService
  ) {}

  ngOnInit() {
    this.loadAdminInfo();
    this.loadStats();
    this.loadPeriods();
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

  loadPeriods() {
    this.periodService.getAllPeriods().subscribe({
      next: (periods) => {
        this.periods = periods;
      },
      error: (error) => {
        console.error('Erreur chargement périodes:', error);
      }
    });
  }

  onPeriodChange(event: any) {
    const periodId = event.target.value;
    if (periodId) {
      this.selectedPeriodId = parseInt(periodId);
      const period = this.periods.find(p => p.id === this.selectedPeriodId);
      this.selectedPeriodName = period?.name || '';
    } else {
      this.selectedPeriodId = null;
    }
  }
}