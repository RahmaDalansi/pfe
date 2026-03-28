// schedule-generator.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminProfessorService, ProfessorPreferences } from '../../../services/admin-professor.service';

@Component({
  selector: 'app-schedule-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-generator.component.html',
  styleUrls: ['./schedule-generator.component.css']
})
export class ScheduleGeneratorComponent implements OnInit {
  // Données des professeurs et leurs préférences
  professorsPreferences: ProfessorPreferences[] = [];
  isLoading = false;
  
  // Configuration de génération
  generationConfig = {
    academicYear: '2024-2025',
    semester: 1,
    startDate: '',
    endDate: '',
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    timeSlots: [
      { start: '08:00', end: '10:00' },
      { start: '10:00', end: '12:00' },
      { start: '14:00', end: '16:00' },
      { start: '16:00', end: '18:00' }
    ]
  };
  
  // États de l'interface
  showPreferences = false;
  showConstraints = false;
  showPreview = false;
  
  // Résultat de génération (simulé pour l'instant)
  generatedSchedule: any = null;
  generationInProgress = false;
  generationSuccess = false;
  
  dayLabels: { [key: string]: string } = {
    'MONDAY': 'Lundi',
    'TUESDAY': 'Mardi',
    'WEDNESDAY': 'Mercredi',
    'THURSDAY': 'Jeudi',
    'FRIDAY': 'Vendredi',
    'SATURDAY': 'Samedi'
  };
  
  timeSlotLabels: { [key: string]: string } = {
    'MORNING': 'Matin (8h-12h)',
    'AFTERNOON': 'Après-midi (14h-18h)'
  };
  
  constructor(private adminProfessorService: AdminProfessorService) {}
  
  ngOnInit() {
    this.loadPreferences();
  }
  
  loadPreferences() {
    this.isLoading = true;
    this.adminProfessorService.getAllProfessorsPreferences().subscribe({
      next: (data: ProfessorPreferences[]) => {
        this.professorsPreferences = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement préférences:', error);
        this.isLoading = false;
      }
    });
  }
  
  // Méthode appelée lors du clic sur "Générer l'emploi"
  generateSchedule() {
    // Vérifier si des professeurs ont soumis leurs préférences
    const submittedCount = this.professorsPreferences.filter(p => p.hasSubmitted).length;
    
    if (submittedCount === 0) {
      alert('⚠️ Aucun professeur n\'a encore soumis ses préférences. La génération risque d\'être sous-optimale.');
    } else if (submittedCount < this.professorsPreferences.length) {
      alert(`⚠️ Seulement ${submittedCount}/${this.professorsPreferences.length} professeurs ont soumis leurs préférences.`);
    }
    
    this.generationInProgress = true;
    
    // TODO: Appeler l'API de génération d'emploi du temps
    // Pour l'instant, on simule une génération après 2 secondes
    setTimeout(() => {
      this.generationInProgress = false;
      this.generationSuccess = true;
      this.showPreview = true;
      
      // Simuler un emploi du temps généré
      this.generatedSchedule = this.generateMockSchedule();
      
      // Afficher une notification
      this.showNotification('success', 'Emploi du temps généré avec succès !');
    }, 2000);
  }
  
  // Générer un emploi du temps simulé (à remplacer par l'API réelle)
  generateMockSchedule() {
    const days = this.generationConfig.workingDays;
    const schedule: any = {};
    
    days.forEach(day => {
      schedule[day] = [];
      // Simuler quelques cours
      schedule[day].push({
        subject: 'Mathématiques',
        professor: 'Prof. Dupont',
        room: 'A101',
        startTime: '08:00',
        endTime: '10:00'
      });
      schedule[day].push({
        subject: 'Informatique',
        professor: 'Prof. Martin',
        room: 'B202',
        startTime: '10:00',
        endTime: '12:00'
      });
    });
    
    return schedule;
  }
  
  // Exporter l'emploi du temps (PDF/Excel)
  exportSchedule(format: 'pdf' | 'excel') {
    // TODO: Implémenter l'export
    alert(`📄 Export en ${format.toUpperCase()} - Fonctionnalité à venir`);
  }
  
  // Sauvegarder l'emploi du temps
  saveSchedule() {
    // TODO: Sauvegarder en base de données
    alert('💾 Emploi du temps sauvegardé - Fonctionnalité à venir');
  }
  
  showNotification(type: string, message: string) {
    // Implémentation simple
    console.log(`${type}: ${message}`);
    // Vous pouvez utiliser un service de notification ici
  }
  
  // Méthodes utilitaires pour l'affichage
  getPreferenceSummary(pref: ProfessorPreferences): string {
    const preferences = [];
    if (pref.preferredDays && pref.preferredDays.length > 0) {
      const days = pref.preferredDays.map(d => this.dayLabels[d]).join(', ');
      preferences.push(`Jours préférés: ${days}`);
    }
    if (pref.unavailableDays && pref.unavailableDays.length > 0) {
      const days = pref.unavailableDays.map(d => this.dayLabels[d]).join(', ');
      preferences.push(`Indisponible: ${days}`);
    }
    if (pref.preferredTimeSlots && pref.preferredTimeSlots.length > 0) {
      const slots = pref.preferredTimeSlots.map(s => this.timeSlotLabels[s]).join(', ');
      preferences.push(`Périodes préférées: ${slots}`);
    }
    return preferences.length > 0 ? preferences.join(' · ') : 'Aucune préférence';
  }
  
  getSubmissionRate(): number {
    if (this.professorsPreferences.length === 0) return 0;
    const submitted = this.professorsPreferences.filter(p => p.hasSubmitted).length;
    return Math.round((submitted / this.professorsPreferences.length) * 100);
  }

  toggleWorkingDay(day: string, event: any) {
    if (event.target.checked) {
        if (!this.generationConfig.workingDays.includes(day)) {
            this.generationConfig.workingDays.push(day);
        }
    } else {
        this.generationConfig.workingDays = this.generationConfig.workingDays.filter(d => d !== day);
    }
}


}