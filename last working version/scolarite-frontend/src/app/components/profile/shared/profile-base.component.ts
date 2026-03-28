import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, timer } from 'rxjs';
import { ProfileService, Profile } from '../../../services/profile.service';
import { Notification, PasswordData, getInitials, getNotificationIcon, getPasswordStrength } from './profile-utils';

@Component({
  selector: 'app-profile-base',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: '', // Template vide - à étendre
})
export class ProfileBaseComponent implements OnInit, OnDestroy {
  // Données du profil
  profile: Profile | null = null;
  isLoading = false;
  
  // Édition profil commun
  editProfile: Partial<Profile> = {};
  isEditing = false;
  isSaving = false;
  
  // Changement de mot de passe
  passwordData: PasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordError = '';
  isUpdatingPassword = false;
  
  // Notification
  notification: Notification | null = null;
  private notificationTimer: Subscription | null = null;
  
  // Subject pour la destruction
  protected destroy$ = new Subject<void>();

  constructor(protected profileService: ProfileService) {}

  ngOnInit() {
    this.loadProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.notificationTimer) {
      this.notificationTimer.unsubscribe();
    }
  }

  // Méthodes de chargement
  loadProfile() {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('danger', 'Erreur lors du chargement du profil');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Méthodes d'édition
  startEditing() {
    if (this.profile) {
      this.editProfile = {
        firstName: this.profile.firstName,
        lastName: this.profile.lastName,
        email: this.profile.email,
        cin: this.profile.cin
      };
      this.isEditing = true;
    }
  }

  cancelEditing() {
    this.isEditing = false;
    this.editProfile = {};
  }

  saveProfile() {
    if (!this.editProfile) return;

    this.isSaving = true;
    this.profileService.updateProfile(this.editProfile).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('success', '✅ Profil mis à jour avec succès');
          this.isEditing = false;
          this.loadProfile();
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

  // Méthodes de mot de passe
  isPasswordFormValid(): boolean {
    return this.passwordData.currentPassword.length > 0 &&
           this.passwordData.newPassword.length >= 6 &&
           this.passwordData.newPassword === this.passwordData.confirmPassword;
  }

  getPasswordStrengthClass(): string {
    return getPasswordStrength(this.passwordData.newPassword);
  }

  changePassword() {
    if (!this.isPasswordFormValid()) {
      this.passwordError = 'Vérifiez que les mots de passe correspondent (min 6 caractères)';
      return;
    }

    this.isUpdatingPassword = true;
    this.passwordError = '';

    this.profileService.changePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('success', '✅ Mot de passe modifié avec succès');
          this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        } else {
          this.showNotification('danger', response.message);
        }
        this.isUpdatingPassword = false;
      },
      error: (error) => {
        this.passwordError = error.error?.message || 'Erreur lors du changement de mot de passe';
        this.isUpdatingPassword = false;
      }
    });
  }

  // Méthodes utilitaires
  getInitials(): string {
    return getInitials(
      this.profile?.firstName,
      this.profile?.lastName,
      this.profile?.username
    );
  }

  getNotificationIcon(type: string): string {
    return getNotificationIcon(type);
  }

  showNotification(type: 'success' | 'danger' | 'warning' | 'info', message: string) {
    this.notification = { type, message };
    if (this.notificationTimer) {
      this.notificationTimer.unsubscribe();
    }
    this.notificationTimer = timer(5000).subscribe(() => {
      this.notification = null;
    });
  }
}