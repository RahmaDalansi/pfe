// src/app/components/admin/level-management/level-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../../services/department.service';
import { Department, Specialty, Level } from '../../../models/department.models';

@Component({
  selector: 'app-level-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './level-management.component.html',
  styleUrls: ['./level-management.component.css']
})
export class LevelManagementComponent implements OnInit {
  levels: Level[] = [];
  filteredLevels: Level[] = [];
  departments: Department[] = [];
  specialties: Specialty[] = [];
  isLoading = false;
  
  showModal = false;
  isEditing = false;
  currentLevel: Level = this.getEmptyLevel();
  
  searchTerm = '';
  departmentFilter: number | null = null;
  specialtyFilter: number | null = null;
  activeOnly = true;
  
  notification: { type: string; message: string } | null = null;

  constructor(private departmentService: DepartmentService) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadLevels();
  }

  getEmptyLevel(): Level {
    return {
      id: 0,
      yearNumber: 1,
      name: '',
      semesterCount: 2,
      isActive: true,
      specialtyId: 0,
      specialtyName: '',
      groupCount: 0
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
    if (this.departmentFilter) {
      this.departmentService.getSpecialties(true, this.departmentFilter).subscribe({
        next: (data) => {
          this.specialties = data;
        },
        error: (error) => {
          console.error('Erreur chargement spécialités:', error);
        }
      });
    } else {
      this.specialties = [];
    }
  }

  loadLevels() {
    this.isLoading = true;
    this.departmentService.getLevels(this.activeOnly, this.specialtyFilter || undefined).subscribe({
      next: (data) => {
        this.levels = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors du chargement des niveaux');
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.levels];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(term)
      );
    }
    
    this.filteredLevels = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onDepartmentFilterChange() {
    this.specialtyFilter = null;
    this.loadSpecialties();
    this.loadLevels();
  }

  onSpecialtyFilterChange() {
    this.loadLevels();
  }

  onActiveOnlyChange() {
    this.loadLevels();
  }

  resetFilters() {
    this.searchTerm = '';
    this.departmentFilter = null;
    this.specialtyFilter = null;
    this.loadLevels();
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentLevel = this.getEmptyLevel();
    this.showModal = true;
  }

  openEditModal(level: Level) {
    this.isEditing = true;
    this.currentLevel = { ...level };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentLevel = this.getEmptyLevel();
  }

  saveLevel() {
    if (this.currentLevel.specialtyId === 0) {
      this.showNotification('warning', 'Veuillez sélectionner une spécialité');
      return;
    }

    if (this.isEditing && this.currentLevel.id) {
      this.departmentService.updateLevel(this.currentLevel.id, this.currentLevel).subscribe({
        next: () => {
          this.showNotification('success', 'Niveau mis à jour avec succès');
          this.closeModal();
          this.loadLevels();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la mise à jour');
        }
      });
    } else {
      this.departmentService.createLevel(this.currentLevel).subscribe({
        next: () => {
          this.showNotification('success', 'Niveau créé avec succès');
          this.closeModal();
          this.loadLevels();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }

  deleteLevel(level: Level) {
    if (confirm(`Voulez-vous désactiver le niveau "${level.name}" ?`)) {
      this.departmentService.deleteLevel(level.id).subscribe({
        next: () => {
          this.showNotification('success', 'Niveau désactivé avec succès');
          this.loadLevels();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la désactivation');
        }
      });
    }
  }

  hardDeleteLevel(level: Level, event: Event) {
    event.stopPropagation();
    if (confirm(`⚠️ ATTENTION : Voulez-vous supprimer DÉFINITIVEMENT le niveau "${level.name}" ?\nCette action est IRRÉVERSIBLE et supprimera tous les groupes associés.`)) {
      this.departmentService.hardDeleteLevel(level.id).subscribe({
        next: () => {
          this.showNotification('success', 'Niveau supprimé définitivement');
          this.loadLevels();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  toggleStatus(level: Level) {
    const newStatus = !level.isActive;
    const action = newStatus ? 'réactivé' : 'désactivé';
    
    if (confirm(`Voulez-vous ${action} le niveau "${level.name}" ?`)) {
      this.departmentService.updateLevel(level.id, { isActive: newStatus }).subscribe({
        next: () => {
          this.showNotification('success', `Niveau ${action} avec succès`);
          this.loadLevels();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors du changement de statut');
        }
      });
    }
  }

  getYearLabel(yearNumber: number): string {
    const labels: { [key: number]: string } = {
      1: '1ère Année',
      2: '2ème Année',
      3: '3ème Année'
    };
    return labels[yearNumber] || `${yearNumber}ème Année`;
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