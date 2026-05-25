// src/app/components/admin/specialty-management/specialty-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../../services/department.service';
import { Department, Specialty } from '../../../models/department.models';

@Component({
  selector: 'app-specialty-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './specialty-management.component.html',
  styleUrls: ['./specialty-management.component.css']
})
export class SpecialtyManagementComponent implements OnInit {
  specialties: Specialty[] = [];
  filteredSpecialties: Specialty[] = [];
  departments: Department[] = [];
  isLoading = false;
  
  showModal = false;
  isEditing = false;
  currentSpecialty: Specialty = this.getEmptySpecialty();
  
  searchTerm = '';
  departmentFilter: number | null = null;
  activeOnly = true;
  
  notification: { type: string; message: string } | null = null;

  constructor(private departmentService: DepartmentService) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadSpecialties();
  }

  getEmptySpecialty(): Specialty {
    return {
      id: 0,
      code: '',
      name: '',
      description: '',
      durationYears: 3,
      isActive: true,
      departmentId: 0,
      departmentName: '',
      levelCount: 0
    };
  }

  loadDepartments() {
    this.departmentService.getDepartments(true).subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (error) => {
        console.error('Erreur chargement départements:', error);
      }
    });
  }

  loadSpecialties() {
    this.isLoading = true;
    this.departmentService.getSpecialties(this.activeOnly, this.departmentFilter || undefined).subscribe({
      next: (data) => {
        this.specialties = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors du chargement des spécialités');
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.specialties];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.code.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term)
      );
    }
    
    this.filteredSpecialties = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onDepartmentFilterChange() {
    this.loadSpecialties();
  }

  onActiveOnlyChange() {
    this.loadSpecialties();
  }

  resetFilters() {
    this.searchTerm = '';
    this.departmentFilter = null;
    this.loadSpecialties();
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentSpecialty = this.getEmptySpecialty();
    this.showModal = true;
  }

  openEditModal(specialty: Specialty) {
    this.isEditing = true;
    this.currentSpecialty = { ...specialty };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentSpecialty = this.getEmptySpecialty();
  }

  saveSpecialty() {
    if (!this.currentSpecialty.code || !this.currentSpecialty.name) {
      this.showNotification('warning', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.currentSpecialty.departmentId === 0) {
      this.showNotification('warning', 'Veuillez sélectionner un département');
      return;
    }

    if (this.isEditing && this.currentSpecialty.id) {
      this.departmentService.updateSpecialty(this.currentSpecialty.id, this.currentSpecialty).subscribe({
        next: () => {
          this.showNotification('success', 'Spécialité mise à jour avec succès');
          this.closeModal();
          this.loadSpecialties();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la mise à jour');
        }
      });
    } else {
      this.departmentService.createSpecialty(this.currentSpecialty).subscribe({
        next: () => {
          this.showNotification('success', 'Spécialité créée avec succès');
          this.closeModal();
          this.loadSpecialties();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }

  deleteSpecialty(specialty: Specialty) {
    if (confirm(`Voulez-vous désactiver la spécialité "${specialty.name}" ?`)) {
      this.departmentService.deleteSpecialty(specialty.id).subscribe({
        next: () => {
          this.showNotification('success', 'Spécialité désactivée avec succès');
          this.loadSpecialties();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la désactivation');
        }
      });
    }
  }

  hardDeleteSpecialty(specialty: Specialty, event: Event) {
    event.stopPropagation();
    if (confirm(`⚠️ ATTENTION : Voulez-vous supprimer DÉFINITIVEMENT la spécialité "${specialty.name}" ?\nCette action est IRRÉVERSIBLE et supprimera tous les niveaux et groupes associés.`)) {
      this.departmentService.hardDeleteSpecialty(specialty.id).subscribe({
        next: () => {
          this.showNotification('success', 'Spécialité supprimée définitivement');
          this.loadSpecialties();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  toggleStatus(specialty: Specialty) {
    const newStatus = !specialty.isActive;
    const action = newStatus ? 'réactivée' : 'désactivée';
    
    if (confirm(`Voulez-vous ${action} la spécialité "${specialty.name}" ?`)) {
      this.departmentService.updateSpecialty(specialty.id, { isActive: newStatus }).subscribe({
        next: () => {
          this.showNotification('success', `Spécialité ${action} avec succès`);
          this.loadSpecialties();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors du changement de statut');
        }
      });
    }
  }

  getDepartmentName(departmentId: number): string {
    const dept = this.departments.find(d => d.id === departmentId);
    return dept ? dept.name : '';
  }

  showNotification(type: string, message: string) {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
  }

  getStatusBadge(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-secondary';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }
}