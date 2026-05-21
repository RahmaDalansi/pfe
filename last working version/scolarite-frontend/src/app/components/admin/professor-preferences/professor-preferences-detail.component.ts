// professor-preferences-detail.component.ts corrigé
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionPeriodService } from '../../../services/submission-period.service';

@Component({
  selector: 'app-professor-preferences-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professor-preferences-detail.component.html',
  styleUrls: ['./professor-preferences-detail.component.css']
})
export class ProfessorPreferencesDetailComponent implements OnInit, OnChanges {
  @Input() periodId!: number;
  @Input() professorKeycloakId!: string;
  @Input() professorName!: string;
  @Input() openModal: boolean = false;  // ✅ NOUVEAU: Input pour ouvrir le modal depuis le parent
  @Output() close = new EventEmitter<void>();
  
  preferences: any = null;
  isLoading = false;
  showModal = false;
  
  days = [
    { value: 'MONDAY', label: 'Lundi' },
    { value: 'TUESDAY', label: 'Mardi' },
    { value: 'WEDNESDAY', label: 'Mercredi' },
    { value: 'THURSDAY', label: 'Jeudi' },
    { value: 'FRIDAY', label: 'Vendredi' },
    { value: 'SATURDAY', label: 'Samedi' },
    { value: 'SUNDAY', label: 'Dimanche' }
  ];
  
  constructor(private periodService: SubmissionPeriodService) {}
  
  ngOnInit() {}
  
  ngOnChanges(changes: SimpleChanges) {
    // ✅ Quand openModal devient true, on ouvre le modal
    if (changes['openModal'] && changes['openModal'].currentValue === true) {
      this.openModalAndLoad();
    }
  }
  
  openModalAndLoad() {
    console.log('🔓 Ouverture du modal pour:', this.professorName);
    this.showModal = true;
    this.loadPreferences();
  }
  
  closeModal() {
    console.log('🔒 Fermeture du modal');
    this.showModal = false;
    this.close.emit();
  }
  
  loadPreferences() {
    if (!this.periodId || !this.professorKeycloakId) {
      console.error('❌ Paramètres manquants:', { periodId: this.periodId, professorKeycloakId: this.professorKeycloakId });
      this.preferences = this.getDefaultPreferences();
      return;
    }
    
    this.isLoading = true;
    console.log('🔍 Chargement des préférences pour:', this.professorKeycloakId);
    
    this.periodService.getProfessorPreferences(this.periodId, this.professorKeycloakId).subscribe({
      next: (data) => {
        console.log('✅ Préférences reçues:', data);
        
        if (data && data.dailyPreferences && data.dailyPreferences.length > 0) {
          this.preferences = data;
        } else if (data && (data.preferredDays || data.unavailableDays)) {
          this.preferences = this.convertOldFormat(data);
        } else {
          this.preferences = this.getDefaultPreferences();
        }
        
        if (this.preferences && !this.preferences.professorFirstName) {
          this.preferences.professorFirstName = this.professorName?.split(' ')[0] || '';
          this.preferences.professorLastName = this.professorName?.split(' ')[1] || '';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement préférences:', error);
        this.preferences = this.getDefaultPreferences();
        this.isLoading = false;
      }
    });
  }
  
  convertOldFormat(oldData: any): any {
    const dailyPrefs = this.days.map(day => {
      const isPreferred = oldData.preferredDays?.includes(day.value);
      const isUnavailable = oldData.unavailableDays?.includes(day.value);
      
      return {
        day: day.value,
        dayLabel: day.label,
        morning: { 
          status: isUnavailable ? 'UNAVAILABLE' : (isPreferred ? 'PREFERRED' : 'AVAILABLE')
        },
        afternoon: { 
          status: isUnavailable ? 'UNAVAILABLE' : (isPreferred ? 'PREFERRED' : 'AVAILABLE')
        },
        evening: { 
          status: isUnavailable ? 'UNAVAILABLE' : (isPreferred ? 'PREFERRED' : 'AVAILABLE')
        }
      };
    });
    
    return {
      professorFirstName: oldData.professorFirstName || this.professorName?.split(' ')[0] || '',
      professorLastName: oldData.professorLastName || this.professorName?.split(' ')[1] || '',
      professorEmail: oldData.professorEmail || '',
      dailyPreferences: dailyPrefs,
      maxHoursPerDay: oldData.maxHoursPerDay || 6,
      maxHoursPerWeek: oldData.maxHoursPerWeek || 24,
      globalNotes: oldData.globalNotes || oldData.notes || '',
      submissionStatus: oldData.submissionStatus || 'SUBMITTED',
      submittedAt: oldData.submittedAt
    };
  }
  
  getDefaultPreferences(): any {
    return {
      professorFirstName: this.professorName?.split(' ')[0] || '',
      professorLastName: this.professorName?.split(' ')[1] || '',
      professorEmail: '',
      dailyPreferences: this.days.map(day => ({
        day: day.value,
        dayLabel: day.label,
        morning: { status: 'AVAILABLE' },
        afternoon: { status: 'AVAILABLE' },
        evening: { status: 'AVAILABLE' }
      })),
      maxHoursPerDay: 6,
      maxHoursPerWeek: 24,
      globalNotes: '',
      submissionStatus: 'NOT_SUBMITTED'
    };
  }
  
  getSubmissionStatusClass(): string {
    if (!this.preferences) return 'bg-secondary';
    if (this.preferences.submissionStatus === 'SUBMITTED') return 'bg-success';
    if (this.preferences.submissionStatus === 'EXCEPTION_GRANTED') return 'bg-warning';
    return 'bg-secondary';
  }
  
  getSubmissionStatusText(): string {
    if (!this.preferences) return 'Non défini';
    if (this.preferences.submissionStatus === 'SUBMITTED') return '✅ Soumis';
    if (this.preferences.submissionStatus === 'EXCEPTION_GRANTED') return '⚠️ Période exceptionnelle';
    return '⏳ Non soumis';
  }
  
  getDayLabel(dayValue: string): string {
    const day = this.days.find(d => d.value === dayValue);
    return day ? day.label : dayValue;
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'PREFERRED': return 'bg-success text-white';
      case 'AVAILABLE': return 'bg-info text-white';
      case 'UNAVAILABLE': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
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
}