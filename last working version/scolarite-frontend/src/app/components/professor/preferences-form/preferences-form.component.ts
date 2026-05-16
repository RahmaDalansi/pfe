// src/app/components/professor/preferences-form/preferences-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessorService } from '../../../services/professor.service';

export interface TimeSlotPreference {
  status: 'PREFERRED' | 'AVAILABLE' | 'UNAVAILABLE';
  reason?: string;
  reasonType?: 'MEDICAL' | 'FAMILY' | 'OTHER_JOB' | 'OTHER';
}

export interface DailyPreferences {
  day: string;
  dayLabel: string;
  morning: TimeSlotPreference;
  afternoon: TimeSlotPreference;
  evening: TimeSlotPreference;
}

export interface TeachingPreferencesExtended {
  dailyPreferences: DailyPreferences[];
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  globalNotes: string;
  isSubmitted: boolean;
  submittedAt?: Date;
}

@Component({
  selector: 'app-preferences-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preferences-form.component.html',
  styleUrls: ['./preferences-form.component.css']
})
export class PreferencesFormComponent implements OnInit {
  days = [
    { value: 'MONDAY', label: 'Lundi' },
    { value: 'TUESDAY', label: 'Mardi' },
    { value: 'WEDNESDAY', label: 'Mercredi' },
    { value: 'THURSDAY', label: 'Jeudi' },
    { value: 'FRIDAY', label: 'Vendredi' },
    { value: 'SATURDAY', label: 'Samedi' },
    { value: 'SUNDAY', label: 'Dimanche' }
  ];
  
  timeSlots = [
    { value: 'morning', label: 'Matin', hours: '8h - 12h' },
    { value: 'afternoon', label: 'Après-midi', hours: '14h - 18h' },
    { value: 'evening', label: 'Soir', hours: '18h - 21h' }
  ];
  
  statusOptions = [
    { value: 'PREFERRED', label: '✅ Très favorable', icon: 'bi-star-fill', class: 'bg-success' },
    { value: 'AVAILABLE', label: '✓ Possible', icon: 'bi-check-circle', class: 'bg-info' },
    { value: 'UNAVAILABLE', label: '❌ Impossible', icon: 'bi-x-circle', class: 'bg-danger' }
  ];
  
  reasonTypes = [
    { value: 'MEDICAL', label: '🏥 Médical / Santé' },
    { value: 'FAMILY', label: '👨‍👩‍👧‍👦 Familial' },
    { value: 'OTHER_JOB', label: '💼 Autre travail' },
    { value: 'OTHER', label: '📝 Autre raison' }
  ];
  
  preferences: TeachingPreferencesExtended = {
    dailyPreferences: [],
    maxHoursPerDay: 6,
    maxHoursPerWeek: 24,
    globalNotes: '',
    isSubmitted: false
  };
  
  isLoading = false;
  isSubmitting = false;
  periodOpen = true;
  
  // Pour le modal de raison
  selectedSlot: { day: string, dayLabel: string, slot: string, slotLabel: string } | null = null;
  tempReason: string = '';
  tempReasonType: string = 'OTHER';
  
  notification: { type: string; message: string } | null = null;
  
  constructor(private professorService: ProfessorService) {}
  
  ngOnInit() {
    this.initializeDailyPreferences();
    this.loadPreferences();
    this.checkSubmissionPeriod();
  }
  
  initializeDailyPreferences() {
    this.preferences.dailyPreferences = this.days.map(day => ({
      day: day.value,
      dayLabel: day.label,
      morning: { status: 'AVAILABLE' },
      afternoon: { status: 'AVAILABLE' },
      evening: { status: 'AVAILABLE' }
    }));
  }
  
  loadPreferences() {
    this.isLoading = true;
    this.professorService.getPreferences().subscribe({
      next: (data: any) => {
        if (data && data.dailyPreferences) {
          this.preferences = data;
        } else if (data && data.preferredDays) {
          this.migrateFromOldFormat(data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement préférences:', error);
        this.isLoading = false;
      }
    });
  }
  
  migrateFromOldFormat(oldData: any) {
    this.preferences.dailyPreferences.forEach(dp => {
      if (oldData.preferredDays?.includes(dp.day)) {
        dp.morning.status = 'PREFERRED';
        dp.afternoon.status = 'PREFERRED';
        dp.evening.status = 'PREFERRED';
      }
      if (oldData.unavailableDays?.includes(dp.day)) {
        dp.morning.status = 'UNAVAILABLE';
        dp.afternoon.status = 'UNAVAILABLE';
        dp.evening.status = 'UNAVAILABLE';
      }
    });
    
    if (oldData.preferredTimeSlots?.includes('MORNING')) {
      this.preferences.dailyPreferences.forEach(dp => {
        if (dp.morning.status !== 'UNAVAILABLE') dp.morning.status = 'PREFERRED';
      });
    }
    if (oldData.preferredTimeSlots?.includes('AFTERNOON')) {
      this.preferences.dailyPreferences.forEach(dp => {
        if (dp.afternoon.status !== 'UNAVAILABLE') dp.afternoon.status = 'PREFERRED';
      });
    }
    
    this.preferences.maxHoursPerDay = oldData.maxHoursPerDay || 6;
    this.preferences.maxHoursPerWeek = oldData.maxHoursPerWeek || 24;
    this.preferences.globalNotes = oldData.notes || '';
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
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'PREFERRED': return 'bg-success';
      case 'AVAILABLE': return 'bg-info';
      case 'UNAVAILABLE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
  
  getStatusIcon(status: string): string {
    switch(status) {
      case 'PREFERRED': return 'bi-star-fill';
      case 'AVAILABLE': return 'bi-check-circle';
      case 'UNAVAILABLE': return 'bi-x-circle';
      default: return 'bi-question-circle';
    }
  }
  
  getStatusLabel(status: string): string {
    switch(status) {
      case 'PREFERRED': return 'Très favorable';
      case 'AVAILABLE': return 'Possible';
      case 'UNAVAILABLE': return 'Impossible';
      default: return 'Non défini';
    }
  }
  
  // ✅ Nouvelle méthode: Changement d'état via select
  onStatusChange(day: string, slot: string, newStatus: string) {
    const dayPref = this.preferences.dailyPreferences.find(dp => dp.day === day);
    if (!dayPref) return;
    
    const slotPref = slot === 'morning' ? dayPref.morning :
                     slot === 'afternoon' ? dayPref.afternoon : dayPref.evening;
    
    const oldStatus = slotPref.status;
    
    // Mettre à jour le statut
    slotPref.status = newStatus as any;
    
    // Si on passe à UNAVAILABLE, ouvrir le modal pour la raison
    if (newStatus === 'UNAVAILABLE') {
      this.openReasonModal(day, dayPref.dayLabel, slot, 
        slot === 'morning' ? 'Matin' : slot === 'afternoon' ? 'Après-midi' : 'Soir');
    }
    
    // Si on quitte UNAVAILABLE, effacer la raison
    if (oldStatus === 'UNAVAILABLE' && newStatus !== 'UNAVAILABLE') {
      delete slotPref.reason;
      delete slotPref.reasonType;
    }
  }
  
  openReasonModal(day: string, dayLabel: string, slot: string, slotLabel: string) {
    const dayPref = this.preferences.dailyPreferences.find(dp => dp.day === day);
    if (dayPref) {
      const slotPref = slot === 'morning' ? dayPref.morning :
                       slot === 'afternoon' ? dayPref.afternoon : dayPref.evening;
      
      this.selectedSlot = { day, dayLabel, slot, slotLabel };
      this.tempReason = slotPref.reason || '';
      this.tempReasonType = slotPref.reasonType || 'OTHER';
      
      const modalElement = document.getElementById('reasonModal');
      if (modalElement) {
        // @ts-ignore
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }
  
  saveReason() {
    if (!this.selectedSlot) return;
    
    // ✅ Validation: raison obligatoire
    if (!this.tempReason || this.tempReason.trim().length === 0) {
      this.showNotification('warning', '⚠️ La raison est obligatoire pour marquer un créneau comme "Impossible"');
      return;
    }
    
    const dayPref = this.preferences.dailyPreferences.find(dp => dp.day === this.selectedSlot!.day);
    if (dayPref) {
      const slotPref = this.selectedSlot!.slot === 'morning' ? dayPref.morning :
                       this.selectedSlot!.slot === 'afternoon' ? dayPref.afternoon : dayPref.evening;
      
      slotPref.reason = this.tempReason.trim();
      slotPref.reasonType = this.tempReasonType as any;
    }
    
    this.closeReasonModal();
    this.showNotification('success', 'Raison enregistrée');
  }
  
  closeReasonModal() {
    this.selectedSlot = null;
    this.tempReason = '';
    this.tempReasonType = 'OTHER';
    const modalElement = document.getElementById('reasonModal');
    if (modalElement) {
      // @ts-ignore
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }
  
  // ✅ Validation avant soumission
  validateAllUnavailableHaveReasons(): boolean {
    const missingReasons: string[] = [];
    
    for (const dayPref of this.preferences.dailyPreferences) {
      // Vérifier Matin
      if (dayPref.morning.status === 'UNAVAILABLE' && (!dayPref.morning.reason || dayPref.morning.reason.trim().length === 0)) {
        missingReasons.push(`${dayPref.dayLabel} - Matin`);
      }
      // Vérifier Après-midi
      if (dayPref.afternoon.status === 'UNAVAILABLE' && (!dayPref.afternoon.reason || dayPref.afternoon.reason.trim().length === 0)) {
        missingReasons.push(`${dayPref.dayLabel} - Après-midi`);
      }
      // Vérifier Soir
      if (dayPref.evening.status === 'UNAVAILABLE' && (!dayPref.evening.reason || dayPref.evening.reason.trim().length === 0)) {
        missingReasons.push(`${dayPref.dayLabel} - Soir`);
      }
    }
    
    if (missingReasons.length > 0) {
      this.showNotification('warning', `⚠️ Raisons manquantes pour : ${missingReasons.join(', ')}`);
      return false;
    }
    return true;
  }
  
  onSubmit() {
    if (!this.periodOpen) {
      this.showNotification('danger', 'La période de saisie est fermée');
      return;
    }
    
    // ✅ Vérifier que tous les créneaux "Impossible" ont une raison
    if (!this.validateAllUnavailableHaveReasons()) {
      return;
    }
    
    this.isSubmitting = true;
    this.preferences.isSubmitted = true;
    this.preferences.submittedAt = new Date();
    
    const payload = {
      dailyPreferences: this.preferences.dailyPreferences,
      maxHoursPerDay: this.preferences.maxHoursPerDay,
      maxHoursPerWeek: this.preferences.maxHoursPerWeek,
      globalNotes: this.preferences.globalNotes,
      isSubmitted: this.preferences.isSubmitted,
      submittedAt: this.preferences.submittedAt
    };
    
    this.professorService.savePreferences(payload as any).subscribe({
      next: (saved) => {
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