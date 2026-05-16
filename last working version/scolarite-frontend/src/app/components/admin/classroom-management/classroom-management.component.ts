// src/app/components/admin/classroom-management/classroom-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassroomService, Classroom } from '../../../services/classroom.service';

@Component({
  selector: 'app-classroom-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classroom-management.component.html',
  styleUrls: ['./classroom-management.component.css']
})
export class ClassroomManagementComponent implements OnInit {
  classrooms: Classroom[] = [];
  filteredClassrooms: Classroom[] = [];
  isLoading = false;
  
  // Modal
  showModal = false;
  isEditing = false;
  currentClassroom: Classroom = this.getEmptyClassroom();
  
  // Filtres
  searchTerm = '';
  typeFilter: 'all' | 'COURS' | 'LABO' | 'AMPHI'  = 'all';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  
  // Statistiques (calculées dans le composant au lieu du template)
  totalClassrooms = 0;
  activeClassrooms = 0;
  inactiveClassrooms = 0; 
  coursClassrooms = 0;
  laboClassrooms = 0;
  amphiClassrooms = 0;
  
  // Notification
  notification: { type: string; message: string } | null = null;
  
  // Types de salle disponibles
  classroomTypes = [
    { value: 'COURS', label: 'Salle de cours' },
    { value: 'LABO', label: 'Laboratoire' },
    { value: 'AMPHI', label: 'Amphithéâtre' }
  ];

  constructor(private classroomService: ClassroomService) {}

  ngOnInit() {
    this.loadClassrooms();
  }

  getEmptyClassroom(): Classroom {
    return {
      id: 0,
      name: '',
      number: '',
      type: 'COURS',
      capacity: 30,
      isActive: true
    };
  }

  loadClassrooms() {
    this.isLoading = true;
    this.classroomService.getAllClassrooms().subscribe({
      next: (data) => {
        this.classrooms = data;
        this.updateStatistics();  // ✅ Mettre à jour les stats
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors du chargement des salles');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }


  updateStatistics() {
    this.totalClassrooms = this.classrooms.length;
    this.activeClassrooms = this.classrooms.filter(c => c.isActive === true).length;
    this.inactiveClassrooms = this.classrooms.filter(c => c.isActive === false).length;

    this.coursClassrooms = this.classrooms.filter(c => c.type === 'COURS').length;
    this.laboClassrooms = this.classrooms.filter(c => c.type === 'LABO').length;
    this.amphiClassrooms = this.classrooms.filter(c => c.type === 'AMPHI').length;
  }

  applyFilters() {
    let filtered = [...this.classrooms];
    
    // Filtre par type
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === this.typeFilter);
    }
    
    // Filtre par statut
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(c => c.isActive === true);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(c => c.isActive === false);
    }
    
    // Filtre par recherche (nom ou numéro)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        (c.number && c.number.toLowerCase().includes(term))
      );
    }
    
    this.filteredClassrooms = filtered;
  }

  onFilterChange() {
    this.applyFilters();
  }

  resetFilters() {
    this.typeFilter = 'all';
    this.statusFilter = 'all';
    this.searchTerm = '';
    this.applyFilters();
    this.showNotification('info', 'Filtres réinitialisés');
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentClassroom = this.getEmptyClassroom();
    this.showModal = true;
  }

  openEditModal(classroom: Classroom) {
    this.isEditing = true;
    this.currentClassroom = { ...classroom };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentClassroom = this.getEmptyClassroom();
  }

  saveClassroom() {
    if (!this.currentClassroom.name) {
      this.showNotification('warning', 'Le nom de la salle est obligatoire');
      return;
    }
    
    if (!this.currentClassroom.capacity || this.currentClassroom.capacity < 1) {
      this.showNotification('warning', 'La capacité doit être supérieure à 0');
      return;
    }
    
    if (this.isEditing && this.currentClassroom.id) {
      this.classroomService.updateClassroom(this.currentClassroom.id, this.currentClassroom).subscribe({
        next: () => {
          this.showNotification('success', 'Salle mise à jour avec succès');
          this.closeModal();
          this.loadClassrooms();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la mise à jour');
        }
      });
    } else {
      this.classroomService.createClassroom(this.currentClassroom).subscribe({
        next: () => {
          this.showNotification('success', 'Salle créée avec succès');
          this.closeModal();
          this.loadClassrooms();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }

  toggleStatus(classroom: Classroom) {
    const newStatus = !classroom.isActive;
    const action = newStatus ? 'activée' : 'désactivée';
    
    if (confirm(`Voulez-vous vraiment ${action} la salle "${classroom.name}" ?`)) {
      this.classroomService.updateClassroom(classroom.id, { isActive: newStatus }).subscribe({
        next: () => {
          this.showNotification('success', `Salle ${action} avec succès`);
          this.loadClassrooms();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors du changement de statut');
        }
      });
    }
  }

    deleteClassroom(classroom: Classroom) {
        if (confirm(`⚠️ ATTENTION : Voulez-vous vraiment supprimer DÉFINITIVEMENT la salle "${classroom.name}" ?\nCette action est IRRÉVERSIBLE et supprimera toutes les données associées.`)) {
            this.classroomService.hardDeleteClassroom(classroom.id).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.showNotification('success', 'Salle supprimée définitivement');
                        this.loadClassrooms();
                    } else {
                        this.showNotification('danger', response.message);
                    }
                },
                error: (error) => {
                    this.showNotification('danger', error.error?.message || 'Erreur lors de la suppression');
                }
            });
        }
    }

  getTypeLabel(type: string): string {
    switch(type) {
      case 'COURS': return 'Salle de cours';
      case 'LABO': return 'Laboratoire';
      case 'AMPHI': return 'Amphithéâtre'; 
      default: return type;
    }
  }

  getTypeIcon(type: string): string {
    switch(type) {
      case 'COURS': return 'bi bi-easel';
      case 'LABO': return 'bi bi-pc-display';
      case 'AMPHI': return 'bi bi-columns-gap';      
      default: return 'bi bi-building';
    }
  }

  getStatusBadge(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-secondary';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getCapacityClass(capacity: number): string {
    if (capacity >= 50) return 'text-danger';
    if (capacity >= 30) return 'text-warning';
    return 'text-success';
  }

  showNotification(type: string, message: string) {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
  }
}