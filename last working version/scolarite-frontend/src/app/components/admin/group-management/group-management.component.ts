import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../../services/department.service';
import { Department, Specialty, Level, Group } from '../../../models/department.models';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-management.component.html',
  styleUrls: ['./group-management.component.css']
})
export class GroupManagementComponent implements OnInit {
  groups: Group[] = [];
  filteredGroups: Group[] = [];
  departments: Department[] = [];
  specialties: Specialty[] = [];
  levels: Level[] = [];
  isLoading = false;
  
  showModal = false;
  isEditing = false;
  currentGroup: Group = this.getEmptyGroup();
  
  searchTerm = '';
  departmentFilter: number | null = null;
  specialtyFilter: number | null = null;
  levelFilter: number | null = null;
  activeOnly = true;
  
  notification: { type: string; message: string } | null = null;

  constructor(private departmentService: DepartmentService) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadGroups();
  }

  getEmptyGroup(): Group {
    return {
      id: 0,
      groupNumber: 1,
      name: '',
      studentCount: 0,
      maxCapacity: 30,
      isActive: true,
      levelId: 0,
      levelName: '',
      specialtyId: 0,
      specialtyName: '',
      departmentId: 0,
      departmentName: ''
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
    if (this.specialtyFilter) {
      this.departmentService.getLevels(true, this.specialtyFilter).subscribe({
        next: (data) => {
          this.levels = data;
        },
        error: (error) => {
          console.error('Erreur chargement niveaux:', error);
        }
      });
    } else {
      this.levels = [];
    }
  }

  loadGroups() {
    this.isLoading = true;
    this.departmentService.getGroups(this.activeOnly, this.levelFilter || undefined).subscribe({
      next: (data) => {
        this.groups = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors du chargement des groupes');
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.groups];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(term)
      );
    }
    
    this.filteredGroups = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onDepartmentFilterChange() {
    this.specialtyFilter = null;
    this.levelFilter = null;
    this.loadSpecialties();
    this.loadGroups();
  }

  onSpecialtyFilterChange() {
    this.levelFilter = null;
    this.loadLevels();
    this.loadGroups();
  }

  onLevelFilterChange() {
    this.loadGroups();
  }

  onActiveOnlyChange() {
    this.loadGroups();
  }

  resetFilters() {
    this.searchTerm = '';
    this.departmentFilter = null;
    this.specialtyFilter = null;
    this.levelFilter = null;
    this.loadGroups();
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentGroup = this.getEmptyGroup();
    this.showModal = true;
  }

  openEditModal(group: Group) {
    this.isEditing = true;
    this.currentGroup = { ...group };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentGroup = this.getEmptyGroup();
  }

  saveGroup() {
    if (this.currentGroup.levelId === 0) {
      this.showNotification('warning', 'Veuillez sélectionner un niveau');
      return;
    }

    if (this.isEditing && this.currentGroup.id) {
      this.departmentService.updateGroup(this.currentGroup.id, this.currentGroup).subscribe({
        next: () => {
          this.showNotification('success', 'Groupe mis à jour avec succès');
          this.closeModal();
          this.loadGroups();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la mise à jour');
        }
      });
    } else {
      this.departmentService.createGroup(this.currentGroup).subscribe({
        next: () => {
          this.showNotification('success', 'Groupe créé avec succès');
          this.closeModal();
          this.loadGroups();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }

  deleteGroup(group: Group) {
    if (confirm(`Voulez-vous désactiver le groupe "${group.name}" ?`)) {
      this.departmentService.deleteGroup(group.id).subscribe({
        next: () => {
          this.showNotification('success', 'Groupe désactivé avec succès');
          this.loadGroups();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la désactivation');
        }
      });
    }
  }

  hardDeleteGroup(group: Group, event: Event) {
    event.stopPropagation();
    if (confirm(`⚠️ ATTENTION : Voulez-vous supprimer DÉFINITIVEMENT le groupe "${group.name}" ?\nCette action est IRRÉVERSIBLE.`)) {
      this.departmentService.hardDeleteGroup(group.id).subscribe({
        next: () => {
          this.showNotification('success', 'Groupe supprimé définitivement');
          this.loadGroups();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  toggleStatus(group: Group) {
    const newStatus = !group.isActive;
    const action = newStatus ? 'réactivé' : 'désactivé';
    
    if (confirm(`Voulez-vous ${action} le groupe "${group.name}" ?`)) {
      this.departmentService.updateGroup(group.id, { isActive: newStatus }).subscribe({
        next: () => {
          this.showNotification('success', `Groupe ${action} avec succès`);
          this.loadGroups();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors du changement de statut');
        }
      });
    }
  }

  getCapacityStatus(capacity: number, studentCount: number): string {
    const ratio = studentCount / capacity;
    if (ratio >= 0.9) return 'text-danger';
    if (ratio >= 0.7) return 'text-warning';
    return 'text-success';
  }

  getCapacityIcon(capacity: number, studentCount: number): string {
    const ratio = studentCount / capacity;
    if (ratio >= 0.9) return 'bi-exclamation-triangle';
    if (ratio >= 0.7) return 'bi-hourglass-split';
    return 'bi-check-circle';
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