// submission-statistics.component.ts - Version corrigée
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionPeriodService } from '../../../services/submission-period.service';
import { ProfessorPreferencesDetailComponent } from '../professor-preferences/professor-preferences-detail.component';

export interface ProfessorSubmissionStatus {
  keycloakId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  submissionStatus: 'SUBMITTED' | 'NOT_SUBMITTED' | 'EXCEPTION_GRANTED';
  submittedAt?: Date;
  hasExceptionPeriod: boolean;
}

export interface SubmissionStatistics {
  periodId: number;
  periodName: string;
  totalProfessors: number;
  submittedCount: number;
  notSubmittedCount: number;
  exceptionGrantedCount: number;
  submittedProfessors: ProfessorSubmissionStatus[];
  notSubmittedProfessors: ProfessorSubmissionStatus[];
  exceptionProfessors: ProfessorSubmissionStatus[];
}

@Component({
  selector: 'app-submission-statistics',
  standalone: true,
  imports: [CommonModule, ProfessorPreferencesDetailComponent],
  templateUrl: './submission-statistics.component.html',
  styleUrls: ['./submission-statistics.component.css']
})
export class SubmissionStatisticsComponent implements OnInit, OnChanges {
  @Input() periodId!: number;
  @Input() periodName!: string;
  
  statistics: SubmissionStatistics | null = null;
  isLoading = false;
  selectedTab: 'submitted' | 'notSubmitted' | 'exception' = 'submitted';
  
  // Pour le modal des préférences
  selectedProfessor: ProfessorSubmissionStatus | null = null;
  showPreferencesModal = false;

  constructor(private periodService: SubmissionPeriodService) {}
  
  ngOnInit() {
    if (this.periodId) {
      this.loadStatistics();
    }
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['periodId'] && !changes['periodId'].firstChange && this.periodId) {
      console.log('🔄 Période changée, rechargement des stats...');
      this.loadStatistics();
    }
  }
  
  loadStatistics() {
    if (!this.periodId) {
      console.warn('⚠️ Aucun periodId fourni');
      return;
    }
    
    this.isLoading = true;
    console.log('📊 Chargement des statistiques pour la période:', this.periodId);
    
    this.periodService.getSubmissionStatistics(this.periodId).subscribe({
      next: (data) => {
        console.log('📊 Statistiques reçues:', data);
        this.statistics = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement statistiques:', error);
        this.isLoading = false;
      }
    });
  }
  
  getProfessorsForCurrentTab(): ProfessorSubmissionStatus[] {
    if (!this.statistics) return [];
    switch(this.selectedTab) {
      case 'submitted': return this.statistics.submittedProfessors || [];
      case 'exception': return this.statistics.exceptionProfessors || [];
      default: return this.statistics.notSubmittedProfessors || [];
    }
  }
  
  getTabTitle(): string {
    switch(this.selectedTab) {
      case 'submitted': return 'Professeurs ayant soumis';
      case 'exception': return 'Professeurs avec période exceptionnelle';
      default: return 'Professeurs n\'ayant pas soumis';
    }
  }
  
  // ✅ CORRECTION: Chaque onglet retourne son propre compteur
  getSubmittedCount(): number {
    return this.statistics?.submittedCount || 0;
  }
  
  getExceptionCount(): number {
    return this.statistics?.exceptionGrantedCount || 0;
  }
  
  getNotSubmittedCount(): number {
    return this.statistics?.notSubmittedCount || 0;
  }
  
  getProgressPercent(): number {
    if (!this.statistics || this.statistics.totalProfessors === 0) return 0;
    return (this.statistics.submittedCount / this.statistics.totalProfessors) * 100;
  }

  viewPreferences(professor: ProfessorSubmissionStatus) {
    console.log('🔍 Affichage des préférences pour:', professor);
    this.selectedProfessor = professor;
    this.showPreferencesModal = true;
  }

  closePreferencesModal() {
    this.showPreferencesModal = false;
    this.selectedProfessor = null;
  }

  refresh() {
    this.loadStatistics();
  }
  
  getProfessorFullName(professor: ProfessorSubmissionStatus): string {
    if (professor.firstName && professor.lastName) {
      return `${professor.firstName} ${professor.lastName}`;
    }
    if (professor.firstName) return professor.firstName;
    if (professor.lastName) return professor.lastName;
    return professor.username || professor.email || professor.keycloakId;
  }
  
  hasSubmitted(professor: ProfessorSubmissionStatus): boolean {
    return professor.submissionStatus === 'SUBMITTED';
  }
  
  getStatusBadgeClass(professor: ProfessorSubmissionStatus): string {
    switch(professor.submissionStatus) {
      case 'SUBMITTED': return 'bg-success';
      case 'EXCEPTION_GRANTED': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }
  
  getStatusText(professor: ProfessorSubmissionStatus): string {
    switch(professor.submissionStatus) {
      case 'SUBMITTED': return 'Soumis';
      case 'EXCEPTION_GRANTED': return 'Exception accordée';
      default: return 'Non soumis';
    }
  }
}