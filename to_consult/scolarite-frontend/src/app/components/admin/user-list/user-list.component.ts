import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserManagementService, UserDetails } from '../../../services/user-management.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: UserDetails[] = [];
  filteredUsers: UserDetails[] = [];
  isLoading = false;
  
  // Filtres
  roleFilter: string = 'ALL';
  searchTerm: string = '';
  searchType: string = 'all';
  
  // Sélection multiple
  selectedUsers: Set<string> = new Set();
  selectAllChecked: boolean = false;
  bulkActionInProgress: boolean = false;
  
  notification: { type: string; message: string; details?: any[] } | null = null;

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userManagementService.getAllUsers(this.roleFilter, this.searchTerm).subscribe({
      next: (users: UserDetails[]) => {
        this.users = users.map(user => ({
          ...user,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          initials: this.getInitials(user)
        }));
        this.applyFilters();
        this.isLoading = false;
        // Réinitialiser la sélection après chargement
        this.clearSelection();
      },
      error: (error: any) => {
        this.showNotification('error', 'Erreur lors du chargement des utilisateurs');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

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

  applyFilters() {
    let filtered = [...this.users];
    
    // Filtre par rôle
    if (this.roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.roles.includes(this.roleFilter));
    }
    
    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.trim().toLowerCase();
      
      filtered = filtered.filter(user => {
        switch(this.searchType) {
          case 'username':
            return user.username.toLowerCase().includes(searchLower);
          case 'cin':
            return user.cin && user.cin.toLowerCase().includes(searchLower);
          case 'email':
            return user.email.toLowerCase().includes(searchLower);
          case 'name':
            return (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
                   (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
                   (user.fullName && user.fullName.toLowerCase().includes(searchLower));
          default:
            return user.username.toLowerCase().includes(searchLower) ||
                   (user.cin && user.cin.toLowerCase().includes(searchLower)) ||
                   user.email.toLowerCase().includes(searchLower) ||
                   (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
                   (user.lastName && user.lastName.toLowerCase().includes(searchLower));
        }
      });
    }
    
    this.filteredUsers = filtered;
    
    // Mettre à jour l'état "sélectionner tout" après filtrage
    this.updateSelectAllState();
  }

  // ==================== MÉTHODES DE SÉLECTION ====================

  toggleSelectUser(userId: string) {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll() {
    if (this.selectAllChecked) {
      // Désélectionner tous
      this.selectedUsers.clear();
    } else {
      // Sélectionner tous les utilisateurs filtrés
      this.filteredUsers.forEach(user => {
        this.selectedUsers.add(user.id);
      });
    }
    this.updateSelectAllState();
  }

  updateSelectAllState() {
    if (this.filteredUsers.length === 0) {
      this.selectAllChecked = false;
    } else {
      const allSelected = this.filteredUsers.every(user => this.selectedUsers.has(user.id));
      this.selectAllChecked = allSelected;
    }
  }

  clearSelection() {
    this.selectedUsers.clear();
    this.selectAllChecked = false;
  }

  getSelectedCount(): number {
    return this.selectedUsers.size;
  }

  // ==================== ACTIONS GROUPÉES ====================

  async bulkResetPasswords() {
    if (this.getSelectedCount() === 0) {
      this.showNotification('warning', 'Veuillez sélectionner au moins un utilisateur');
      return;
    }
    
    const selectedUsernames = Array.from(this.selectedUsers).map(id => {
      const user = this.users.find(u => u.id === id);
      return user?.username || id;
    }).join(', ');
    
    const message = `⚠️ ACTION DE MASSE :\n\n` +
                    `Vous êtes sur le point de réinitialiser les mots de passe de ${this.getSelectedCount()} utilisateur(s) :\n` +
                    `${selectedUsernames}\n\n` +
                    `Le nouveau mot de passe sera leur CIN.\n\n` +
                    `Cette action est irréversible. Voulez-vous continuer ?`;
    
    if (confirm(message)) {
      this.bulkActionInProgress = true;
      
      this.userManagementService.bulkResetPasswords(Array.from(this.selectedUsers)).subscribe({
        next: (response) => {
          this.showBulkActionResult('Réinitialisation des mots de passe', response);
          this.bulkActionInProgress = false;
          this.clearSelection();
          this.loadUsers(); // Recharger pour mettre à jour
        },
        error: (error) => {
          this.showNotification('error', error.error?.message || 'Erreur lors de la réinitialisation groupée');
          this.bulkActionInProgress = false;
        }
      });
    }
  }

  async bulkToggleStatus(enable: boolean) {
    if (this.getSelectedCount() === 0) {
      this.showNotification('warning', 'Veuillez sélectionner au moins un utilisateur');
      return;
    }
    
    const action = enable ? 'activer' : 'désactiver';
    const actionPast = enable ? 'activés' : 'désactivés';
    
    const selectedUsernames = Array.from(this.selectedUsers).map(id => {
      const user = this.users.find(u => u.id === id);
      return user?.username || id;
    }).join(', ');
    
    let message = `⚠️ ACTION DE MASSE :\n\n` +
                  `Vous êtes sur le point de ${action} ${this.getSelectedCount()} utilisateur(s) :\n` +
                  `${selectedUsernames}\n\n`;
    
    if (!enable) {
      message += `⚠️ ATTENTION : La désactivation de comptes peut bloquer l'accès des utilisateurs.\n`;
      message += `Assurez-vous de ne pas désactiver tous les administrateurs.\n\n`;
    }
    
    message += `Voulez-vous continuer ?`;
    
    if (confirm(message)) {
      this.bulkActionInProgress = true;
      
      this.userManagementService.bulkToggleStatus(Array.from(this.selectedUsers), enable).subscribe({
        next: (response) => {
          this.showBulkActionResult(`Comptes ${actionPast}`, response);
          this.bulkActionInProgress = false;
          this.clearSelection();
          this.loadUsers(); // Recharger pour mettre à jour
        },
        error: (error) => {
          this.showNotification('error', error.error?.message || `Erreur lors de l'${action} groupée`);
          this.bulkActionInProgress = false;
        }
      });
    }
  }

  showBulkActionResult(actionName: string, response: any) {
    const successCount = response.successCount || 0;
    const failureCount = response.failureCount || 0;
    
    let message = `${actionName} : ${successCount} succès, ${failureCount} échecs`;
    
    if (response.results && response.results.length > 0) {
      const failures = response.results.filter((r: any) => !r.success);
      if (failures.length > 0) {
        message += '\n\n❌ Échecs :\n';
        failures.forEach((f: any) => {
          message += `- ${f.userId}: ${f.message}\n`;
        });
      }
    }
    
    this.showNotification(successCount > 0 && failureCount === 0 ? 'success' : 'warning', message);
  }

  // ==================== AUTRES MÉTHODES ====================

  onFilterChange() {
    this.loadUsers();
  }

  onSearchChange() {
    this.applyFilters();
  }

  resetFilters() {
    this.roleFilter = 'ALL';
    this.searchTerm = '';
    this.searchType = 'all';
    this.loadUsers();
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

  getStatusBadge(user: UserDetails): string {
    if (!user.enabled) return 'bg-secondary';
    if (user.roles.includes('ADMIN')) return 'bg-danger';
    if (user.roles.includes('PROFESSOR')) return 'bg-success';
    if (user.roles.includes('STUDENT')) return 'bg-primary';
    return 'bg-info';
  }

  getStatusText(user: UserDetails): string {
    if (!user.enabled) return 'Désactivé';
    if (user.roles.includes('ADMIN')) return 'Admin';
    if (user.roles.includes('PROFESSOR')) return 'Professeur';
    if (user.roles.includes('STUDENT')) return 'Étudiant';
    return 'Utilisateur';
  }

  showNotification(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 5000);
  }

  // Ajouter cette méthode pour compter les utilisateurs par rôle
getCountByRole(role: string): number {
  return this.users.filter(user => user.roles.includes(role)).length;
}

// Ajouter cette méthode pour obtenir le libellé du type de recherche
getSearchTypeLabel(type: string): string {
  switch(type) {
    case 'username': return 'Nom d\'utilisateur';
    case 'cin': return 'CIN';
    case 'email': return 'Email';
    case 'name': return 'Nom/Prénom';
    default: return 'Tous les champs';
  }
}
}