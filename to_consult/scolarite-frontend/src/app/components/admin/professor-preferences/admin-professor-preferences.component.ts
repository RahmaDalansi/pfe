import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProfessorService } from '../../../services/admin-professor.service';
import { FormsModule } from '@angular/forms';

interface ProfessorPreferences {
  professorId: string;
  professorName: string;
  email: string;
  preferredDays: string[];
  unavailableDays: string[];
  preferredTimeSlots: string[];
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  notes: string;
  submittedAt: Date;
  hasSubmitted: boolean;
}

@Component({
  selector: 'app-admin-professor-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-professor-preferences.component.html',
  styleUrls: ['./admin-professor-preferences.component.css']
})
export class AdminProfessorPreferencesComponent implements OnInit {
  preferences: ProfessorPreferences[] = [];
  filteredPreferences: ProfessorPreferences[] = [];
  isLoading = false;
  
  searchTerm = '';
  filterSubmitted: 'all' | 'submitted' | 'not-submitted' = 'all';
  
  dayLabels: { [key: string]: string } = {
    'MONDAY': 'Lundi',
    'TUESDAY': 'Mardi',
    'WEDNESDAY': 'Mercredi',
    'THURSDAY': 'Jeudi',
    'FRIDAY': 'Vendredi',
    'SATURDAY': 'Samedi'
  };
  
  constructor(private adminProfessorService: AdminProfessorService) {}
  
  ngOnInit() {
    this.loadPreferences();
  }
  
  loadPreferences() {
    this.isLoading = true;
    this.adminProfessorService.getAllProfessorsPreferences().subscribe({
      next: (data: ProfessorPreferences[]) => {
        this.preferences = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement préférences:', error);
        this.isLoading = false;
      }
    });
  }
  
  applyFilters() {
    let filtered = [...this.preferences];
    
    // Filtre par soumission
    if (this.filterSubmitted === 'submitted') {
      filtered = filtered.filter(p => p.hasSubmitted);
    } else if (this.filterSubmitted === 'not-submitted') {
      filtered = filtered.filter(p => !p.hasSubmitted);
    }
    
    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.professorName.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      );
    }
    
    this.filteredPreferences = filtered;
  }
  
  getStatusBadge(hasSubmitted: boolean): string {
    return hasSubmitted ? 'bg-success' : 'bg-warning text-dark';
  }
  
  getStatusText(hasSubmitted: boolean): string {
    return hasSubmitted ? 'Soumis' : 'Non soumis';
  }
  
  getDaysList(days: string[]): string {
    if (!days || days.length === 0) return 'Aucun';
    return days.map(d => this.dayLabels[d]).join(', ');
  }
}