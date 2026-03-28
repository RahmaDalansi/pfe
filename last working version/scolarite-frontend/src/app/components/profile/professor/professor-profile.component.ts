import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, ProfessorExtendedProfile } from '../../../services/profile.service';
import { ProfileBaseComponent } from '../shared/profile-base.component';
import { getInitials, getNotificationIcon } from '../shared/profile-utils';

@Component({
  selector: 'app-professor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professor-profile.component.html',
  styleUrls: ['./professor-profile.component.css']
})
export class ProfessorProfileComponent extends ProfileBaseComponent implements OnInit {
  professor: ProfessorExtendedProfile | null = null;
  
  // Données spécifiques professeur
  isEditingProfessor = false;
  editProfessorData: Partial<ProfessorExtendedProfile> = {};
  
  // Données du profil commun (surcharge pour professeur)
  isEditingCommon = false;
  commonProfile: Partial<ProfessorExtendedProfile> = {};

  constructor(protected override profileService: ProfileService) {
    super(profileService);
  }

  override ngOnInit() {
    this.loadProfessorProfile();
  }

  loadProfessorProfile() {
    this.isLoading = true;
    this.profileService.getProfessorExtendedProfile().subscribe({
      next: (data) => {
        if (data) {
          this.professor = data;
          this.profile = data; // Pour la compatibilité avec le composant base
        } else {
          this.createBaseProfessorProfile();
        }
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 404) {
          this.createBaseProfessorProfile();
        } else {
          this.showNotification('danger', 'Erreur lors du chargement du profil');
          this.isLoading = false;
        }
      }
    });
  }

  createBaseProfessorProfile() {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.professor = {
          ...data,
          specialite: '',
          bureau: '',
          telephone: '',
          subjects: [],
          hasSubmittedPreferences: false
        };
        this.profile = this.professor;
        this.isLoading = false;
        
        // Création automatique du profil professeur en backend
        this.createProfessorProfileOnBackend();
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors du chargement du profil');
        this.isLoading = false;
      }
    });
  }

  createProfessorProfileOnBackend() {
    if (this.professor) {
      this.profileService.updateProfessorInfo({
        specialite: '',
        bureau: '',
        telephone: ''
      }).subscribe({
        next: () => {
          console.log('Profil professeur créé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la création du profil professeur:', error);
        }
      });
    }
  }

  // Surcharge pour gérer l'édition des infos communes
  override startEditing() {
    if (this.professor) {
      this.commonProfile = {
        firstName: this.professor.firstName,
        lastName: this.professor.lastName,
        email: this.professor.email,
        cin: this.professor.cin
      };
      this.isEditingCommon = true;
    }
  }

  override cancelEditing() {
    this.isEditingCommon = false;
    this.commonProfile = {};
  }

  override saveProfile() {
    if (!this.commonProfile) return;

    this.isSaving = true;
    this.profileService.updateProfile(this.commonProfile).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('success', '✅ Informations personnelles mises à jour');
          this.isEditingCommon = false;
          this.loadProfessorProfile();
        } else {
          this.showNotification('danger', response.message);
        }
        this.isSaving = false;
      },
      error: (error) => {
        this.showNotification('danger', error.error?.message || 'Erreur lors de la mise à jour');
        this.isSaving = false;
      }
    });
  }

  // Édition des informations spécifiques professeur
  startEditingProfessor() {
    if (this.professor) {
      this.editProfessorData = {
        specialite: this.professor.specialite,
        bureau: this.professor.bureau,
        telephone: this.professor.telephone,
        dateEmbauche: this.professor.dateEmbauche
      };
      this.isEditingProfessor = true;
    }
  }

  cancelEditingProfessor() {
    this.isEditingProfessor = false;
    this.editProfessorData = {};
  }

  saveProfessorInfo() {
    if (!this.editProfessorData) return;

    this.isSaving = true;
    this.profileService.updateProfessorInfo(this.editProfessorData).subscribe({
      next: (updated) => {
        this.professor = updated;
        this.profile = updated;
        this.showNotification('success', '✅ Informations professionnelles mises à jour');
        this.isEditingProfessor = false;
        this.isSaving = false;
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors de la mise à jour');
        this.isSaving = false;
        console.error('Erreur:', error);
      }
    });
  }

  getSubjectsList(): string {
    if (!this.professor?.subjects || this.professor.subjects.length === 0) {
      return 'Aucune matière assignée';
    }
    return this.professor.subjects.map(s => s.name).join(', ');
  }

  override getInitials(): string {
    return getInitials(
      this.professor?.firstName,
      this.professor?.lastName,
      this.professor?.username
    );
  }
}