import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SubmissionPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  isActive: boolean;
  description: string;
}

@Component({
  selector: 'app-submission-periods',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submission-periods.component.html',
  styleUrls: ['./submission-periods.component.css']
})
export class SubmissionPeriodsComponent implements OnInit {
  periods: SubmissionPeriod[] = [];
  filteredPeriods: SubmissionPeriod[] = [];
  isLoading = false;
  
  showModal = false;
  isEditing = false;
  currentPeriod: SubmissionPeriod = this.getEmptyPeriod();
  
  searchTerm = '';
  filterActive: 'all' | 'active' | 'inactive' = 'all';
  
  notification: { type: string; message: string } | null = null;
  
  constructor() {}
  
  ngOnInit() {
    this.loadPeriods();
  }
  
  getEmptyPeriod(): SubmissionPeriod {
    return {
      id: 0,
      name: '',
      startDate: '',
      endDate: '',
      academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      isActive: true,
      description: ''
    };
  }
  
  loadPeriods() {
    this.isLoading = true;
    // TODO: Appeler le service pour charger les périodes
    // Pour l'instant, simuler des données
    setTimeout(() => {
      this.periods = [
        {
          id: 1,
          name: 'Semestre 1 - Rentrée',
          startDate: '2024-09-01T00:00:00',
          endDate: '2024-10-15T23:59:59',
          academicYear: '2024-2025',
          isActive: true,
          description: 'Saisie des préférences pour le premier semestre'
        },
        {
          id: 2,
          name: 'Semestre 2 - Rentrée',
          startDate: '2025-02-01T00:00:00',
          endDate: '2025-03-15T23:59:59',
          academicYear: '2024-2025',
          isActive: false,
          description: 'Saisie des préférences pour le second semestre'
        }
      ];
      this.applyFilters();
      this.isLoading = false;
    }, 500);
  }
  
  applyFilters() {
    let filtered = [...this.periods];
    
    if (this.filterActive === 'active') {
      filtered = filtered.filter(p => p.isActive);
    } else if (this.filterActive === 'inactive') {
      filtered = filtered.filter(p => !p.isActive);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.academicYear.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }
    
    this.filteredPeriods = filtered;
  }
  
  openCreateModal() {
    this.isEditing = false;
    this.currentPeriod = this.getEmptyPeriod();
    this.showModal = true;
  }
  
  openEditModal(period: SubmissionPeriod) {
    this.isEditing = true;
    this.currentPeriod = { ...period };
    this.showModal = true;
  }
  
  closeModal() {
    this.showModal = false;
    this.currentPeriod = this.getEmptyPeriod();
  }
  
  savePeriod() {
    if (!this.currentPeriod.name || !this.currentPeriod.startDate || !this.currentPeriod.endDate) {
      this.showNotification('warning', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Validation des dates
    const start = new Date(this.currentPeriod.startDate);
    const end = new Date(this.currentPeriod.endDate);
    
    if (start >= end) {
      this.showNotification('warning', 'La date de fin doit être postérieure à la date de début');
      return;
    }
    
    if (this.isEditing && this.currentPeriod.id) {
      // TODO: Appeler l'API de mise à jour
      this.showNotification('success', 'Période mise à jour avec succès');
      this.closeModal();
      this.loadPeriods();
    } else {
      // TODO: Appeler l'API de création
      this.showNotification('success', 'Période créée avec succès');
      this.closeModal();
      this.loadPeriods();
    }
  }
  
  toggleActive(period: SubmissionPeriod) {
    period.isActive = !period.isActive;
    // TODO: Appeler l'API de mise à jour
    this.showNotification('success', `Période ${period.isActive ? 'activée' : 'désactivée'} avec succès`);
    this.loadPeriods();
  }
  
  deletePeriod(id: number, name: string) {
    if (confirm(`Voulez-vous vraiment supprimer la période "${name}" ?`)) {
      // TODO: Appeler l'API de suppression
      this.showNotification('success', 'Période supprimée avec succès');
      this.loadPeriods();
    }
  }
  
  getStatusBadge(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-secondary';
  }
  
  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
  
  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  showNotification(type: string, message: string) {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
  }
  
  getCurrentPeriodStatus(): { isOpen: boolean; periodName?: string } {
    const now = new Date();
    const activePeriod = this.periods.find(p => p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now);
    
    if (activePeriod) {
      return { isOpen: true, periodName: activePeriod.name };
    }
    return { isOpen: false };
  }
}