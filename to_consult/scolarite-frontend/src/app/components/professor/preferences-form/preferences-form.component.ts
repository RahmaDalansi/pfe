import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessorService, TeachingPreferences } from '../../../services/professor.service';

@Component({
  selector: 'app-preferences-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preferences-form.component.html',
  styleUrls: ['./preferences-form.component.css']
})
export class PreferencesFormComponent implements OnInit {
  preferences: TeachingPreferences = {
    professorId: 0,
    preferredDays: [],
    unavailableDays: [],
    preferredTimeSlots: [],
    maxHoursPerDay: 6,
    maxHoursPerWeek: 24,
    notes: '',
    isSubmitted: false
  };
  
  // ✅ Nouvelle structure : matrice des préférences par jour/période
  preferenceMatrix: { [day: string]: { [slot: string]: 'PREFERRED' | 'NOT_PREFERRED' | 'IMPOSSIBLE' } } = {};
  
  days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  timeSlots = ['MORNING', 'AFTERNOON'];
  
  dayLabels: { [key: string]: string } = {
    'MONDAY': 'Lundi',
    'TUESDAY': 'Mardi',
    'WEDNESDAY': 'Mercredi',
    'THURSDAY': 'Jeudi',
    'FRIDAY': 'Vendredi',
    'SATURDAY': 'Samedi'
  };
  
  slotLabels: { [key: string]: string } = {
    'MORNING': 'Matin (8h-12h)',
    'AFTERNOON': 'Après-midi (14h-18h)'
  };
  
  isLoading = false;
  isSubmitting = false;
  periodOpen = true;
  notification: { type: string; message: string } | null = null;
  
  constructor(private professorService: ProfessorService) {}
  
  ngOnInit() {
    this.initializePreferenceMatrix();
    this.loadPreferences();
    this.checkSubmissionPeriod();
  }
  
  // ✅ Initialiser la matrice avec des valeurs par défaut
  initializePreferenceMatrix() {
    this.days.forEach(day => {
      this.preferenceMatrix[day] = {};
      this.timeSlots.forEach(slot => {
        this.preferenceMatrix[day][slot] = 'NOT_PREFERRED';
      });
    });
  }
  
  // ✅ Charger les préférences existantes dans la matrice
  loadPreferences() {
    this.isLoading = true;
    this.professorService.getPreferences().subscribe({
      next: (data) => {
        this.preferences = data;
        
        // Convertir les préférences existantes en matrice
        // Jours préférés
        if (data.preferredDays) {
          data.preferredDays.forEach(day => {
            this.timeSlots.forEach(slot => {
              if (data.preferredTimeSlots.includes(slot)) {
                this.preferenceMatrix[day][slot] = 'PREFERRED';
              } else {
                this.preferenceMatrix[day][slot] = 'NOT_PREFERRED';
              }
            });
          });
        }
        
        // Jours indisponibles
        if (data.unavailableDays) {
          data.unavailableDays.forEach(day => {
            this.timeSlots.forEach(slot => {
              this.preferenceMatrix[day][slot] = 'IMPOSSIBLE';
            });
          });
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement préférences:', error);
        this.isLoading = false;
      }
    });
  }
  
  // ✅ Mettre à jour une préférence
  updatePreference(day: string, slot: string) {
    const current = this.preferenceMatrix[day][slot];
    
    // Cycle : PREFERRED -> NOT_PREFERRED -> IMPOSSIBLE -> PREFERRED
    if (current === 'PREFERRED') {
      this.preferenceMatrix[day][slot] = 'NOT_PREFERRED';
    } else if (current === 'NOT_PREFERRED') {
      this.preferenceMatrix[day][slot] = 'IMPOSSIBLE';
    } else {
      this.preferenceMatrix[day][slot] = 'PREFERRED';
    }
  }
  
  // ✅ Obtenir la classe CSS pour une cellule
  getCellClass(day: string, slot: string): string {
    const value = this.preferenceMatrix[day][slot];
    switch(value) {
      case 'PREFERRED': return 'bg-success text-white';
      case 'IMPOSSIBLE': return 'bg-danger text-white';
      default: return 'bg-light';
    }
  }
  
  // ✅ Obtenir le texte pour une cellule
  getCellText(day: string, slot: string): string {
    const value = this.preferenceMatrix[day][slot];
    switch(value) {
      case 'PREFERRED': return '✔️ Préférable';
      case 'IMPOSSIBLE': return '❌ Impossible';
      default: return '⚪ Non préférable';
    }
  }
  
  // ✅ Convertir la matrice en objet TeachingPreferences avant envoi
  preparePreferencesForSave(): TeachingPreferences {
    const preferredDays: string[] = [];
    const unavailableDays: string[] = [];
    const preferredTimeSlots: string[] = [];
    
    this.days.forEach(day => {
      let hasPreferred = false;
      let hasImpossible = false;
      
      this.timeSlots.forEach(slot => {
        const value = this.preferenceMatrix[day][slot];
        if (value === 'PREFERRED') {
          hasPreferred = true;
          if (!preferredTimeSlots.includes(slot)) {
            preferredTimeSlots.push(slot);
          }
        } else if (value === 'IMPOSSIBLE') {
          hasImpossible = true;
        }
      });
      
      if (hasPreferred) {
        preferredDays.push(day);
      }
      if (hasImpossible) {
        unavailableDays.push(day);
      }
    });
    
    return {
      ...this.preferences,
      preferredDays,
      unavailableDays,
      preferredTimeSlots
    };
  }
  
  checkSubmissionPeriod() {
    this.professorService.getSubmissionPeriodStatus().subscribe({
      next: (status) => {
        this.periodOpen = status.isOpen;
        if (!this.periodOpen && !this.preferences.isSubmitted) {
          this.showNotification('warning', 'La période de saisie des préférences est fermée.');
        }
      },
      error: (error) => {
        console.error('Erreur vérification période:', error);
      }
    });
  }
  
  onSubmit() {
    if (!this.periodOpen) {
      this.showNotification('danger', 'La période de saisie est fermée');
      return;
    }
    
    this.isSubmitting = true;
    const preferencesToSave = this.preparePreferencesForSave();
    preferencesToSave.isSubmitted = true;
    
    this.professorService.savePreferences(preferencesToSave).subscribe({
      next: (saved) => {
        this.preferences = saved;
        this.showNotification('success', 'Préférences enregistrées avec succès !');
        this.isSubmitting = false;
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors de l\'enregistrement');
        this.isSubmitting = false;
        console.error('Erreur:', error);
      }
    });
  }
  
  showNotification(type: string, message: string) {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
  }
}