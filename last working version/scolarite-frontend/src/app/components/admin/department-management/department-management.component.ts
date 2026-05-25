// src/app/components/admin/department-management/department-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../../services/department.service';
import { Department } from '../../../models/department.models';

@Component({
  selector: 'app-department-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './department-management.component.html',
  styleUrls: ['./department-management.component.css']
})
export class DepartmentManagementComponent implements OnInit {
  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  isLoading = false;
  
  showModal = false;
  isEditing = false;
  currentDepartment: Department = this.getEmptyDepartment();
  
  searchTerm = '';
  activeOnly = true;
  
  notification: { type: string; message: string } | null = null;

  constructor(private departmentService: DepartmentService) {}

  ngOnInit() {
    this.loadDepartments();
  }

  getEmptyDepartment(): Department {
    return {
      id: 0,
      code: '',
      name: '',
      description: '',
      headOfDepartment: '',
      isActive: true,
      specialtyCount: 0
    };
  }

  loadDepartments() {
    this.isLoading = true;
    this.departmentService.getDepartments(this.activeOnly).subscribe({
      next: (data) => {
        this.departments = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors du chargement des départements');
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.departments];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.code.toLowerCase().includes(term) ||
        d.name.toLowerCase().includes(term)
      );
    }
    
    this.filteredDepartments = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onActiveOnlyChange() {
    this.loadDepartments();
  }

  resetFilters() {
    this.searchTerm = '';
    this.applyFilters();
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentDepartment = this.getEmptyDepartment();
    this.showModal = true;
  }

  openEditModal(department: Department) {
    this.isEditing = true;
    this.currentDepartment = { ...department };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentDepartment = this.getEmptyDepartment();
  }

  saveDepartment() {
    if (!this.currentDepartment.code || !this.currentDepartment.name) {
      this.showNotification('warning', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.isEditing && this.currentDepartment.id) {
      this.departmentService.updateDepartment(this.currentDepartment.id, this.currentDepartment).subscribe({
        next: () => {
          this.showNotification('success', 'Département mis à jour avec succès');
          this.closeModal();
          this.loadDepartments();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la mise à jour');
        }
      });
    } else {
      this.departmentService.createDepartment(this.currentDepartment).subscribe({
        next: () => {
          this.showNotification('success', 'Département créé avec succès');
          this.closeModal();
          this.loadDepartments();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }

  deleteDepartment(department: Department) {
    if (confirm(`Voulez-vous désactiver le département "${department.name}" ?`)) {
      this.departmentService.deleteDepartment(department.id).subscribe({
        next: () => {
          this.showNotification('success', 'Département désactivé avec succès');
          this.loadDepartments();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la désactivation');
        }
      });
    }
  }

  hardDeleteDepartment(department: Department, event: Event) {
    event.stopPropagation();
    if (confirm(`⚠️ ATTENTION : Voulez-vous supprimer DÉFINITIVEMENT le département "${department.name}" ?\nCette action est IRRÉVERSIBLE et supprimera toutes les spécialités, niveaux et groupes associés.`)) {
      this.departmentService.hardDeleteDepartment(department.id).subscribe({
        next: () => {
          this.showNotification('success', 'Département supprimé définitivement');
          this.loadDepartments();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  toggleStatus(department: Department) {
    const newStatus = !department.isActive;
    const action = newStatus ? 'réactivé' : 'désactivé';
    
    if (confirm(`Voulez-vous ${action} le département "${department.name}" ?`)) {
      this.departmentService.updateDepartment(department.id, { isActive: newStatus }).subscribe({
        next: () => {
          this.showNotification('success', `Département ${action} avec succès`);
          this.loadDepartments();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors du changement de statut');
        }
      });
    }
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

  getShortDescription(description: string | undefined): string {
  if (!description || description.length === 0) {
    return '-';
  }
  if (description.length > 50) {
    return description.substring(0, 50) + '...';
  }
  return description;
}
}