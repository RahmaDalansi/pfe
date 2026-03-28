import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService, Profile } from '../../../services/profile.service';
import { UserManagementService, UserDetails } from '../../../services/user-management.service';
import { KeycloakAuthService } from '../../../services/keycloak.service';

@Component({
  selector: 'app-unified-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unified-profile.component.html',
  styleUrls: ['./unified-profile.component.css']
})
export class UnifiedProfileComponent implements OnInit {
  mode: 'self' | 'admin' = 'self';
  profile: any = null;
  userId: string | null = null;
  
  isLoading = false;
  isEditing = false;
  isSaving = false;
  isUpdatingPassword = false;
  actionInProgress = false;
  
  editData: any = {};
  
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordError = '';
  
  availableRoles: string[] = ['STUDENT', 'PROFESSOR', 'ADMIN'];
  currentUserRoles: string[] = [];
  isCurrentUserAdmin = false;
  
  notification: { type: string; message: string } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private userManagementService: UserManagementService,
    private keycloakService: KeycloakAuthService
  ) {}

  ngOnInit() {
    this.currentUserRoles = this.keycloakService.getUserRoles();
    this.isCurrentUserAdmin = this.currentUserRoles.includes('ADMIN');
    
    const routeUserId = this.route.snapshot.paramMap.get('id');
    
    if (routeUserId) {
      this.mode = 'admin';
      this.userId = routeUserId;
      this.loadUserProfile(this.userId);
    } else {
      this.mode = 'self';
      this.loadMyProfile();
    }
  }

  loadMyProfile() {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.profile = this.enrichProfile(data);
        this.isLoading = false;
      },
      error: (error: any) => {
        this.showNotification('danger', 'Erreur lors du chargement de votre profil');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadUserProfile(userId: string) {
    this.isLoading = true;
    this.userManagementService.getUserById(userId).subscribe({
      next: (data: any) => {
        this.profile = this.enrichProfile(data);
        this.isLoading = false;
      },
      error: (error: any) => {
        this.showNotification('danger', 'Erreur lors du chargement du profil');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  enrichProfile(data: any): any {
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || data.username;
    
    let initials = '?';
    if (firstName && lastName) {
      initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      initials = firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      initials = lastName.charAt(0).toUpperCase();
    } else if (data.username) {
      initials = data.username.charAt(0).toUpperCase();
    }
    
    return {
      ...data,
      fullName,
      initials
    };
  }

  startEditing() {
    if (this.profile) {
      this.editData = {
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
    this.editData = {};
  }

  saveProfile() {
    if (!this.editData) return;
    
    this.isSaving = true;
    
    if (this.mode === 'self') {
      this.profileService.updateProfile(this.editData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showNotification('success', 'Profil mis à jour avec succès');
            this.isEditing = false;
            this.loadMyProfile();
          } else {
            this.showNotification('danger', response.message);
          }
          this.isSaving = false;
        },
        error: (error: any) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la mise à jour');
          this.isSaving = false;
        }
      });
    } else if (this.mode === 'admin' && this.userId) {
      this.userManagementService.updateUser(this.userId, this.editData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showNotification('success', 'Profil mis à jour avec succès');
            this.isEditing = false;
            this.loadUserProfile(this.userId!);
          } else {
            this.showNotification('danger', response.message);
          }
          this.isSaving = false;
        },
        error: (error: any) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la mise à jour');
          this.isSaving = false;
        }
      });
    }
  }

  isPasswordFormValid(): boolean {
    return this.passwordData.currentPassword.length > 0 &&
           this.passwordData.newPassword.length >= 6 &&
           this.passwordData.newPassword === this.passwordData.confirmPassword;
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
      next: (response: any) => {
        if (response.success) {
          this.showNotification('success', 'Mot de passe modifié avec succès');
          this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        } else {
          this.showNotification('danger', response.message);
        }
        this.isUpdatingPassword = false;
      },
      error: (error: any) => {
        this.passwordError = error.error?.message || 'Erreur lors du changement de mot de passe';
        this.isUpdatingPassword = false;
      }
    });
  }

  canShowAdminActions(): boolean {
    return this.isCurrentUserAdmin;
  }

  resetUserPassword() {
    if (!this.profile) return;
    
    const targetUserId = this.mode === 'self' ? this.profile.id : this.userId;
    if (!targetUserId) return;
    
    const message = `Voulez-vous vraiment réinitialiser le mot de passe de ${this.profile.username} ?\nLe nouveau mot de passe sera son CIN : ${this.profile.cin || 'Non spécifié'}`;
    
    if (confirm(message)) {
      this.actionInProgress = true;
      this.userManagementService.resetPassword(targetUserId).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showNotification('success', `Mot de passe réinitialisé avec le CIN : ${this.profile?.cin}`);
          } else {
            this.showNotification('danger', response.message);
          }
          this.actionInProgress = false;
        },
        error: (error: any) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la réinitialisation');
          this.actionInProgress = false;
        }
      });
    }
  }

  toggleUserStatus() {
    if (!this.profile) return;
    
    const targetUserId = this.mode === 'self' ? this.profile.id : this.userId;
    if (!targetUserId) return;
    
    const action = this.profile.enabled ? 'désactiver' : 'activer';
    const warning = !this.profile.enabled ? '' : '\n⚠️ Attention : Désactiver votre propre compte vous déconnectera immédiatement.';
    
    if (confirm(`Voulez-vous vraiment ${action} le compte de ${this.profile.username} ?${warning}`)) {
      this.actionInProgress = true;
      this.userManagementService.toggleUserStatus(targetUserId).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showNotification('success', `Compte ${this.profile?.enabled ? 'désactivé' : 'activé'} avec succès`);
            if (this.mode === 'self' && !this.profile?.enabled) {
              setTimeout(() => {
                this.keycloakService.logout();
              }, 2000);
            } else {
              this.loadUserProfile(targetUserId);
            }
          } else {
            this.showNotification('danger', response.message);
          }
          this.actionInProgress = false;
        },
        error: (error: any) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors du changement de statut');
          this.actionInProgress = false;
        }
      });
    }
  }

  deleteUser() {
    if (!this.profile) return;
    
    const targetUserId = this.mode === 'self' ? this.profile.id : this.userId;
    if (!targetUserId) return;
    
    if (confirm(`⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement le compte de ${this.profile.username} ?\nCette action est irréversible.`)) {
      this.actionInProgress = true;
      this.userManagementService.deleteUser(targetUserId).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showNotification('success', 'Utilisateur supprimé avec succès');
            if (this.mode === 'self') {
              setTimeout(() => {
                this.keycloakService.logout();
              }, 1500);
            } else {
              setTimeout(() => {
                this.router.navigate(['/admin/users']);
              }, 1500);
            }
          } else {
            this.showNotification('danger', response.message);
          }
          this.actionInProgress = false;
        },
        error: (error: any) => {
          this.showNotification('danger', error.error?.message || 'Erreur lors de la suppression');
          this.actionInProgress = false;
        }
      });
    }
  }

  assignRole(role: string) {
    if (!this.profile) return;
    
    const targetUserId = this.mode === 'self' ? this.profile.id : this.userId;
    if (!targetUserId) return;
    
    if (this.profile.roles.includes(role)) {
      this.userManagementService.removeRole(targetUserId, role).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showNotification('success', `Rôle ${role} retiré`);
            if (this.mode === 'self') {
              this.loadMyProfile();
            } else {
              this.loadUserProfile(targetUserId);
            }
          } else {
            this.showNotification('danger', response.message);
          }
        },
        error: (error: any) => {
          this.showNotification('danger', error.error?.message || 'Erreur');
        }
      });
    } else {
      this.userManagementService.assignRole(targetUserId, role).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showNotification('success', `Rôle ${role} assigné`);
            if (this.mode === 'self') {
              this.loadMyProfile();
            } else {
              this.loadUserProfile(targetUserId);
            }
          } else {
            this.showNotification('danger', response.message);
          }
        },
        error: (error: any) => {
          this.showNotification('danger', error.error?.message || 'Erreur');
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    switch(role) {
      case 'ADMIN': return 'bg-danger';
      case 'PROFESSOR': return 'bg-success';
      case 'STUDENT': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  getRoleIcon(role: string): string {
    switch(role) {
      case 'ADMIN': return 'bi bi-shield-lock';
      case 'PROFESSOR': return 'bi bi-person-workspace';
      case 'STUDENT': return 'bi bi-mortarboard';
      default: return 'bi bi-person';
    }
  }

  getStatusBadge(): string {
    if (!this.profile) return 'bg-secondary';
    return this.profile.enabled ? 'bg-success' : 'bg-secondary';
  }

  getStatusText(): string {
    if (!this.profile) return 'Inconnu';
    return this.profile.enabled ? 'Compte activé' : 'Compte désactivé';
  }

  goBack() {
    if (this.mode === 'admin') {
      this.router.navigate(['/admin/users']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  showNotification(type: string, message: string) {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
  }

  formatDate(timestamp: number): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('fr-FR');
  }
}