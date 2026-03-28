// src/app/components/professor/preferences-form/preferences-form.component.ts
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
  
  days = [
    { value: 'MONDAY', label: 'Lundi' },
    { value: 'TUESDAY', label: 'Mardi' },
    { value: 'WEDNESDAY', label: 'Mercredi' },
    { value: 'THURSDAY', label: 'Jeudi' },
    { value: 'FRIDAY', label: 'Vendredi' },
    { value: 'SATURDAY', label: 'Samedi' }
  ];
  
  timeSlots = [
    { value: 'MORNING', label: 'Matin (8h-12h)' },
    { value: 'AFTERNOON', label: 'Après-midi (14h-18h)' }
  ];
  
  isLoading = false;
  isSubmitting = false;
  periodOpen = true;
  notification: { type: string; message: string } | null = null;
  
  constructor(private professorService: ProfessorService) {}
  
  ngOnInit() {
    this.loadPreferences();
    this.checkSubmissionPeriod();
  }
  
  loadPreferences() {
    this.isLoading = true;
    this.professorService.getPreferences().subscribe({
      next: (data) => {
        this.preferences = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement préférences:', error);
        this.isLoading = false;
      }
    });
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
  
  toggleDay(day: string, event: any, isPreferred: boolean) {
    if (isPreferred) {
      if (event.target.checked) {
        this.preferences.preferredDays.push(day);
      } else {
        this.preferences.preferredDays = this.preferences.preferredDays.filter(d => d !== day);
      }
    } else {
      if (event.target.checked) {
        this.preferences.unavailableDays.push(day);
      } else {
        this.preferences.unavailableDays = this.preferences.unavailableDays.filter(d => d !== day);
      }
    }
  }
  
  toggleTimeSlot(slot: string, event: any) {
    if (event.target.checked) {
      this.preferences.preferredTimeSlots.push(slot);
    } else {
      this.preferences.preferredTimeSlots = this.preferences.preferredTimeSlots.filter(s => s !== slot);
    }
  }
  
  isDayPreferred(day: string): boolean {
    return this.preferences.preferredDays.includes(day);
  }
  
  isDayUnavailable(day: string): boolean {
    return this.preferences.unavailableDays.includes(day);
  }
  
  isTimeSlotPreferred(slot: string): boolean {
    return this.preferences.preferredTimeSlots.includes(slot);
  }
  
  onSubmit() {
    if (!this.periodOpen) {
      this.showNotification('danger', 'La période de saisie est fermée');
      return;
    }
    
    this.isSubmitting = true;
    this.preferences.isSubmitted = true;
    
    this.professorService.savePreferences(this.preferences).subscribe({
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