// src/app/components/admin/period-management/period-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubmissionPeriodService } from '../../../services/submission-period.service';
import { SubmissionPeriod } from '../../../models/submission-period.models';

@Component({
  selector: 'app-period-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './period-management.component.html',
  styleUrls: ['./period-management.component.css']
})
export class PeriodManagementComponent implements OnInit {
  periods: SubmissionPeriod[] = [];
  filteredPeriods: SubmissionPeriod[] = [];
  isLoading = false;
  
  // Modal
  showModal = false;
  isEditing = false;
  currentPeriod: SubmissionPeriod = this.getEmptyPeriod();
  
  // Filtres
  searchTerm = '';
  academicYearFilter = '';
  academicYears: string[] = [];
  
  notification: { type: string; message: string } | null = null;
  
  constructor(private periodService: SubmissionPeriodService) {}
  
  ngOnInit() {
    this.loadPeriods();
  }
  
  getEmptyPeriod(): SubmissionPeriod {
    return {
      id: 0,
      name: '',
      academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      semester: 1,
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      isDefault: false
    };
  }
  
  loadPeriods() {
    this.isLoading = true;
    this.periodService.getAllPeriods().subscribe({
      next: (data) => {
        this.periods = data;
        this.extractAcademicYears();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors du chargement des périodes');
        this.isLoading = false;
      }
    });
  }
  
  extractAcademicYears() {
    const years = new Set<string>();
    this.periods.forEach(p => years.add(p.academicYear));
    this.academicYears = Array.from(years).sort().reverse();
  }
  
  applyFilters() {
    let filtered = [...this.periods];
    
    if (this.academicYearFilter) {
      filtered = filtered.filter(p => p.academicYear === this.academicYearFilter);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.academicYear.toLowerCase().includes(term)
      );
    }
    
    this.filteredPeriods = filtered;
  }
  
  onFilterChange() {
    this.applyFilters();
  }
  
  resetFilters() {
    this.academicYearFilter = '';
    this.searchTerm = '';
    this.applyFilters();
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
    if (!this.currentPeriod.name || !this.currentPeriod.academicYear) {
      this.showNotification('warning', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (this.currentPeriod.startDate >= this.currentPeriod.endDate) {
      this.showNotification('warning', 'La date de fin doit être postérieure à la date de début');
      return;
    }
    
    if (this.isEditing && this.currentPeriod.id) {
      this.periodService.updatePeriod(this.currentPeriod.id, this.currentPeriod).subscribe({
        next: () => {
          this.showNotification('success', 'Période mise à jour avec succès');
          this.closeModal();
          this.loadPeriods();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la mise à jour');
        }
      });
    } else {
      this.periodService.createPeriod(this.currentPeriod).subscribe({
        next: () => {
          this.showNotification('success', 'Période créée avec succès');
          this.closeModal();
          this.loadPeriods();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }
  
  deletePeriod(period: SubmissionPeriod) {
    if (confirm(`Voulez-vous vraiment supprimer la période "${period.name}" ?`)) {
      this.periodService.deletePeriod(period.id).subscribe({
        next: () => {
          this.showNotification('success', 'Période supprimée avec succès');
          this.loadPeriods();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }
  
  getStatusBadge(period: SubmissionPeriod): string {
    if (!period.isActive) return 'bg-secondary';
    if (period.isDefault) return 'bg-primary';
    const now = new Date();
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    if (now >= start && now <= end) return 'bg-success';
    if (now < start) return 'bg-info';
    return 'bg-secondary';
  }
  
  getStatusText(period: SubmissionPeriod): string {
    if (!period.isActive) return 'Inactive';
    if (period.isDefault) return 'Par défaut';
    const now = new Date();
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    if (now >= start && now <= end) return 'En cours';
    if (now < start) return 'À venir';
    return 'Terminée';
  }
  
  showNotification(type: string, message: string) {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
  }
}