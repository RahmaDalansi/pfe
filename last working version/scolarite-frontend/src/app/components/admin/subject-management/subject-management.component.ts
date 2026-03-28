// src/app/components/admin/subject-management/subject-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../../services/subject.service';
import { Subject } from '../../../services/professor.service';

@Component({
  selector: 'app-subject-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-management.component.html',
  styleUrls: ['./subject-management.component.css']
})
export class SubjectManagementComponent implements OnInit {
  subjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  isLoading = false;
  
  showModal = false;
  isEditing = false;
  currentSubject: Subject = this.getEmptySubject();
  
  searchTerm = '';
  semesterFilter: number | null = null;
  activeOnly = true;
  
  notification: { type: string; message: string } | null = null;
  
  semesters = [1, 2, 3, 4, 5, 6];
  
  constructor(private subjectService: SubjectService) {}
  
  ngOnInit() {
    this.loadSubjects();
  }
  
  getEmptySubject(): Subject {
    return {
      id: 0,
      code: '',
      name: '',
      description: '',
      weeklyHours: 3,
      semester: 1,
      credits: 3,
      isActive: true,
      isAssignedToCurrentProfessor: false
    };
  }
  
  loadSubjects() {
    this.isLoading = true;
    this.subjectService.getAllSubjects(this.activeOnly).subscribe({
      next: (data) => {
        this.subjects = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors du chargement des matières');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }
  
  applyFilters() {
    let filtered = [...this.subjects];
    
    if (this.semesterFilter) {
      filtered = filtered.filter(s => s.semester === this.semesterFilter);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.code.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term))
      );
    }
    
    this.filteredSubjects = filtered;
  }
  
  onSearchChange() {
    this.applyFilters();
  }
  
  onSemesterChange() {
    this.applyFilters();
  }
  
  onActiveOnlyChange() {
    this.loadSubjects();
  }
  
  resetFilters() {
    this.semesterFilter = null;
    this.searchTerm = '';
    this.applyFilters();
  }
  
  openCreateModal() {
    this.isEditing = false;
    this.currentSubject = this.getEmptySubject();
    this.showModal = true;
  }
  
  openEditModal(subject: Subject) {
    this.isEditing = true;
    this.currentSubject = { ...subject };
    this.showModal = true;
  }
  
  closeModal() {
    this.showModal = false;
    this.currentSubject = this.getEmptySubject();
  }
  
  saveSubject() {
    if (!this.currentSubject.code || !this.currentSubject.name) {
      this.showNotification('warning', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (this.isEditing && this.currentSubject.id) {
      this.subjectService.updateSubject(this.currentSubject.id, this.currentSubject).subscribe({
        next: () => {
          this.showNotification('success', 'Matière mise à jour avec succès');
          this.closeModal();
          this.loadSubjects();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la mise à jour');
        }
      });
    } else {
      this.subjectService.createSubject(this.currentSubject).subscribe({
        next: () => {
          this.showNotification('success', 'Matière créée avec succès');
          this.closeModal();
          this.loadSubjects();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }
  
  deleteSubject(id: number, name: string) {
    if (confirm(`Voulez-vous vraiment supprimer la matière "${name}" ?`)) {
      this.subjectService.deleteSubject(id).subscribe({
        next: () => {
          this.showNotification('success', 'Matière supprimée avec succès');
          this.loadSubjects();
        },
        error: (error) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }
  
  showNotification(type: string, message: string) {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
  }
  
  getSemesterLabel(semester: number): string {
    return `Semestre ${semester}`;
  }
}