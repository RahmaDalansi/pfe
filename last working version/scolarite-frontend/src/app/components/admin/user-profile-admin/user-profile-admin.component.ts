import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserManagementService, UserDetails } from '../../../services/user-management.service';

@Component({
  selector: 'app-user-profile-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-profile-admin.component.html',
  styleUrls: ['./user-profile-admin.component.css']
})
export class UserProfileAdminComponent implements OnInit {
  userId: string = '';
  user: UserDetails | null = null;
  isLoading = false;
  isEditing = false;
  isSaving = false;
  actionInProgress = false;
  
  editData: Partial<UserDetails> = {};
  availableRoles: string[] = ['STUDENT', 'PROFESSOR', 'ADMIN'];
  
  notification: { type: string; message: string } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userManagementService: UserManagementService
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUser();
    }
  }

  loadUser() {
    this.isLoading = true;
    this.userManagementService.getUserById(this.userId).subscribe({
      next: (user: UserDetails) => {
        this.user = {
          ...user,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          initials: this.getInitials(user)
        };
        this.isLoading = false;
      },
      error: (error: any) => {
        this.showNotification('error', 'Erreur lors du chargement du profil');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }


  // ✅ Méthode pour calculer les initiales
  getInitials(user: UserDetails): string {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    return '?';
  }

  
  startEditing() {
    if (this.user) {
      this.editData = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        cin: this.user.cin
      };
      this.isEditing = true;
    }
  }

  cancelEditing() {
    this.isEditing = false;
    this.editData = {};
  }

  saveUser() {
    if (!this.user || !this.editData) return;
    
    this.isSaving = true;
    this.userManagementService.updateUser(this.user.id, this.editData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('success', 'Profil mis à jour avec succès');
          this.isEditing = false;
          this.loadUser();
        } else {
          this.showNotification('error', response.message);
        }
        this.isSaving = false;
      },
      error: (error: any) => {
        this.showNotification('error', error.error?.message || 'Erreur lors de la mise à jour');
        this.isSaving = false;
      }
    });
  }

  resetPassword() {
    if (!this.user) return;
    
    if (confirm(`Voulez-vous vraiment réinitialiser le mot de passe de ${this.user.username} ?\nLe nouveau mot de passe sera son CIN : ${this.user.cin || 'Non spécifié'}`)) {
      this.actionInProgress = true;
      this.userManagementService.resetPassword(this.user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', `Mot de passe réinitialisé avec le CIN : ${this.user?.cin}`);
          } else {
            this.showNotification('error', response.message);
          }
          this.actionInProgress = false;
        },
        error: (error: any) => {
          this.showNotification('error', error.error?.message || 'Erreur lors de la réinitialisation');
          this.actionInProgress = false;
        }
      });
    }
  }

  toggleStatus() {
    if (!this.user) return;
    
    const action = this.user.enabled ? 'désactiver' : 'activer';
    if (confirm(`Voulez-vous vraiment ${action} le compte de ${this.user.username} ?`)) {
      this.actionInProgress = true;
      this.userManagementService.toggleUserStatus(this.user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', `Compte ${this.user?.enabled ? 'désactivé' : 'activé'} avec succès`);
            this.loadUser();
          } else {
            this.showNotification('error', response.message);
          }
          this.actionInProgress = false;
        },
        error: (error: any) => {
          this.showNotification('error', error.error?.message || 'Erreur lors du changement de statut');
          this.actionInProgress = false;
        }
      });
    }
  }

  deleteUser() {
    if (!this.user) return;
    
    if (confirm(`⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement le compte de ${this.user.username} ?\nCette action est irréversible.`)) {
      this.actionInProgress = true;
      this.userManagementService.deleteUser(this.user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', 'Utilisateur supprimé avec succès');
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 1500);
          } else {
            this.showNotification('error', response.message);
          }
          this.actionInProgress = false;
        },
        error: (error: any) => {
          this.showNotification('error', error.error?.message || 'Erreur lors de la suppression');
          this.actionInProgress = false;
        }
      });
    }
  }

  assignRole(role: string) {
    if (!this.user) return;
    
    if (this.user.roles.includes(role)) {
      this.userManagementService.removeRole(this.user.id, role).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', `Rôle ${role} retiré`);
            this.loadUser();
          } else {
            this.showNotification('error', response.message);
          }
        },
        error: (error: any) => {
          this.showNotification('error', error.error?.message || 'Erreur');
        }
      });
    } else {
      this.userManagementService.assignRole(this.user.id, role).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', `Rôle ${role} assigné`);
            this.loadUser();
          } else {
            this.showNotification('error', response.message);
          }
        },
        error: (error: any) => {
          this.showNotification('error', error.error?.message || 'Erreur');
        }
      });
    }
  }

  showNotification(type: 'success' | 'error' | 'info', message: string) {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
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

  goBack() {
    this.router.navigate(['/admin/users']);
  }
}