// src/app/components/admin/exception-period/exception-period.component.ts
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubmissionPeriodService } from '../../../services/submission-period.service';
import { ProfessorPreferencesService } from '../../../services/professor-preferences.service';
import { UserManagementService, UserDetails } from '../../../services/user-management.service';

@Component({
  selector: 'app-exception-period',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exception-period.component.html',
  styleUrls: ['./exception-period.component.css']
})
export class ExceptionPeriodComponent implements OnInit, OnChanges {
  @Input() periodId!: number;
  
  professors: UserDetails[] = [];
  selectedProfessor: UserDetails | null = null;
  existingExceptions: any[] = [];
  showModal = false;
  isSubmitting = false;
  isLoading = false;
  
  // ✅ Utiliser des strings pour le formulaire (comme dans period-management)
  formData = {
    professorKeycloakId: '',
    startDate: '',
    endDate: '',
    reason: ''
  };
  
  notification: { type: string; message: string } | null = null;
  
  constructor(
    private periodService: SubmissionPeriodService,
    private preferencesService: ProfessorPreferencesService,
    private userService: UserManagementService
  ) {}
  
  ngOnInit() {
    this.loadData();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['periodId'] && !changes['periodId'].firstChange) {
      this.loadData();
    }
  }
  
  loadData() {
    if (!this.periodId) return;
    this.loadProfessors();
    this.loadExistingExceptions();
  }
  
  loadProfessors() {
    this.userService.getAllUsers('PROFESSOR', '').subscribe({
      next: (users) => {
        this.professors = users;
        console.log('👨‍🏫 Professeurs chargés:', users.length);
      },
      error: (error) => {
        console.error('Erreur chargement professeurs:', error);
        this.showNotification('danger', 'Erreur chargement professeurs');
      }
    });
  }
  
  loadExistingExceptions() {
    this.isLoading = true;
    this.preferencesService.getExceptionPeriods(this.periodId).subscribe({
      next: (exceptions) => {
        this.existingExceptions = exceptions;
        console.log('📋 Exceptions chargées:', exceptions);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement exceptions:', error);
        this.isLoading = false;
      }
    });
  }
  
  // ✅ Initialiser les dates au format datetime-local
  getDefaultStartDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  
  getDefaultEndDate(): string {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}T${String(nextWeek.getHours()).padStart(2, '0')}:${String(nextWeek.getMinutes()).padStart(2, '0')}`;
  }
  
  openModal() {
    this.showModal = true;
    this.formData = {
      professorKeycloakId: '',
      startDate: this.getDefaultStartDate(),
      endDate: this.getDefaultEndDate(),
      reason: ''
    };
    this.selectedProfessor = null;
  }
  
  closeModal() {
    this.showModal = false;
    this.selectedProfessor = null;
  }
  
  onProfessorSelect() {
    if (this.selectedProfessor) {
      this.formData.professorKeycloakId = this.selectedProfessor.id;
    }
  }
  
  // ✅ Méthode de soumission simplifiée
  submitException() {
    console.log('=== DÉBUT SOUMISSION EXCEPTION ===');
    console.log('formData:', this.formData);
    
    if (!this.formData.professorKeycloakId) {
      this.showNotification('warning', 'Veuillez sélectionner un professeur');
      return;
    }
    
    if (!this.formData.reason || this.formData.reason.trim().length === 0) {
      this.showNotification('warning', 'Veuillez fournir une raison');
      return;
    }
    
    if (!this.formData.startDate || !this.formData.endDate) {
      this.showNotification('warning', 'Veuillez renseigner les dates');
      return;
    }
    
    const startDate = new Date(this.formData.startDate);
    const endDate = new Date(this.formData.endDate);
    
    if (startDate >= endDate) {
      this.showNotification('warning', 'La date de fin doit être postérieure à la date de début');
      return;
    }
    
    this.isSubmitting = true;
    
    // ✅ Envoyer les dates au format ISO string
    const request = {
      professorKeycloakId: this.formData.professorKeycloakId,
      periodId: this.periodId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reason: this.formData.reason
    };
    
    console.log('📤 Payload envoyé au backend:', request);
    
    this.periodService.grantExceptionPeriod(this.periodId, request).subscribe({
      next: (response) => {
        console.log('✅ Réponse backend:', response);
        this.showNotification('success', 'Période exceptionnelle accordée avec succès');
        this.closeModal();
        this.loadExistingExceptions();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('❌ Erreur détaillée:', error);
        this.showNotification('danger', error.error?.message || 'Erreur lors de l\'accord');
        this.isSubmitting = false;
      }
    });
  }
  
  deleteException(exception: any) {
    if (confirm(`Voulez-vous vraiment supprimer la période exceptionnelle pour ${this.getProfessorName(exception.professorKeycloakId)} ?`)) {
      this.periodService.revokeExceptionPeriod(exception.id).subscribe({
        next: () => {
          this.showNotification('success', 'Période exceptionnelle supprimée');
          this.loadExistingExceptions();
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.showNotification('danger', error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }
  
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getProfessorName(professorId: string): string {
    const professor = this.professors.find(p => p.id === professorId);
    if (professor) {
      return `${professor.firstName || ''} ${professor.lastName || ''}`.trim() || professor.username;
    }
    return professorId;
  }
  
  showNotification(type: string, message: string) {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
  }
}