import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminValidationService, PendingUser, ValidationResponse } from '../../../services/admin-validation.service';

@Component({
  selector: 'app-admin-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-validation.component.html',
  styleUrls: ['./admin-validation.component.css']
})
export class AdminValidationComponent implements OnInit {
  pendingUsers: PendingUser[] = [];
  filteredUsers: PendingUser[] = [];
  isLoading = false;
  actionInProgress = false;
  
  showApproveModal = false;
  showRejectModal = false;
  selectedUser: PendingUser | null = null;
  
  availableRoles: string[] = ['STUDENT', 'PROFESSOR', 'ADMIN'];
  selectedRoles: string[] = [];
  rejectionReason = '';
  
  // Filtres
  roleFilter: string = 'ALL'; // 'ALL', 'STUDENT', 'PROFESSOR', 'ADMIN'
  searchTerm: string = ''; // Recherche globale (username, CIN, email, nom)
  searchType: string = 'all'; // 'all', 'username', 'cin', 'email', 'name'
  
  notification: { type: string; message: string } | null = null;

  constructor(private adminValidationService: AdminValidationService) {}

  ngOnInit() {
    this.loadPendingUsers();
    this.loadAvailableRoles();
  }

  loadPendingUsers() {
    this.isLoading = true;
    this.adminValidationService.getPendingUsers().subscribe({
      next: (users: PendingUser[]) => {
        this.pendingUsers = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.showNotification('error', 'Erreur lors du chargement');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadAvailableRoles() {
    this.adminValidationService.getAvailableRoles().subscribe({
      next: (roles: string[]) => {
        this.availableRoles = roles;
      },
      error: (error: any) => {
        console.error('Erreur chargement rôles', error);
      }
    });
  }

  getCountByRole(role: string): number {
    return this.pendingUsers.filter(user => user.requestedRole === role).length;
  }

  // Appliquer les filtres
  applyFilters() {
    let filtered = [...this.pendingUsers];
    
    // Filtre par rôle
    if (this.roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.requestedRole === this.roleFilter);
    }
    
    // Filtre par recherche selon le type sélectionné
    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.trim().toLowerCase();
      
      filtered = filtered.filter(user => {
        switch(this.searchType) {
          case 'username':
            // Recherche par nom d'utilisateur
            return user.username && user.username.toLowerCase().includes(searchTermLower);
            
          case 'cin':
            // Recherche par CIN
            return user.cin && user.cin.toLowerCase().includes(searchTermLower);
            
          case 'email':
            // Recherche par email
            return user.email && user.email.toLowerCase().includes(searchTermLower);
            
          case 'name':
            // Recherche par nom complet (prénom + nom)
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const firstNameMatch = user.firstName && user.firstName.toLowerCase().includes(searchTermLower);
            const lastNameMatch = user.lastName && user.lastName.toLowerCase().includes(searchTermLower);
            return firstNameMatch || lastNameMatch || fullName.includes(searchTermLower);
            
          case 'all':
          default:
            // Recherche dans tous les champs
            const fullNameSearch = `${user.firstName} ${user.lastName}`.toLowerCase();
            return (user.username && user.username.toLowerCase().includes(searchTermLower)) ||
                   (user.cin && user.cin.toLowerCase().includes(searchTermLower)) ||
                   (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
                   (user.firstName && user.firstName.toLowerCase().includes(searchTermLower)) ||
                   (user.lastName && user.lastName.toLowerCase().includes(searchTermLower)) ||
                   fullNameSearch.includes(searchTermLower);
        }
      });
    }
    
    this.filteredUsers = filtered;
  }

  // Méthode appelée quand le filtre de rôle change
  onRoleFilterChange() {
    this.applyFilters();
  }

  // Méthode appelée quand la recherche change
  onSearchChange() {
    this.applyFilters();
  }

  // Méthode appelée quand le type de recherche change
  onSearchTypeChange() {
    this.applyFilters();
  }

  // Réinitialiser tous les filtres
  resetFilters() {
    this.roleFilter = 'ALL';
    this.searchTerm = '';
    this.searchType = 'all';
    this.applyFilters();
    this.showNotification('info', 'Filtres réinitialisés');
  }

  // Obtenir le nombre de résultats filtrés
  getFilteredCount(): number {
    return this.filteredUsers.length;
  }

  // Obtenir le nombre total avant filtrage
  getTotalCount(): number {
    return this.pendingUsers.length;
  }

  openApproveModal(user: PendingUser) {
    this.selectedUser = user;
    this.selectedRoles = [user.requestedRole];
    this.showApproveModal = true;
  }

  openRejectModal(user: PendingUser) {
    this.selectedUser = user;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeModals() {
    this.showApproveModal = false;
    this.showRejectModal = false;
    this.selectedUser = null;
    this.selectedRoles = [];
    this.rejectionReason = '';
  }

  toggleRole(role: string, event: any) {
    if (event.target.checked) {
      this.selectedRoles.push(role);
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r !== role);
    }
  }

  approveUser() {
    if (!this.selectedUser || this.selectedRoles.length === 0) return;
    
    this.actionInProgress = true;
    this.adminValidationService.approveUser(this.selectedUser.id, this.selectedRoles).subscribe({
      next: (response: ValidationResponse) => {
        if (response.success) {
          this.showNotification('success', 'Utilisateur approuvé avec succès');
          this.closeModals();
          this.loadPendingUsers();
        } else {
          this.showNotification('error', response.message);
        }
        this.actionInProgress = false;
      },
      error: (error: any) => {
        this.showNotification('error', error.error?.message || 'Erreur lors de l\'approbation');
        this.actionInProgress = false;
        console.error('Erreur:', error);
      }
    });
  }

  rejectUser() {
    if (!this.selectedUser || !this.rejectionReason) return;
    
    this.actionInProgress = true;
    this.adminValidationService.rejectUser(this.selectedUser.id, this.rejectionReason).subscribe({
      next: (response: ValidationResponse) => {
        if (response.success) {
          this.showNotification('success', 'Utilisateur rejeté et supprimé');
          this.closeModals();
          this.loadPendingUsers();
        } else {
          this.showNotification('error', response.message);
        }
        this.actionInProgress = false;
      },
      error: (error: any) => {
        this.showNotification('error', error.error?.message || 'Erreur lors du rejet');
        this.actionInProgress = false;
        console.error('Erreur:', error);
      }
    });
  }

  showNotification(type: 'success' | 'error' | 'info', message: string) {
    this.notification = { type, message };
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  // Méthode pour obtenir la classe CSS du badge en fonction du rôle
  getRoleBadgeClass(role: string): string {
    switch(role) {
      case 'ADMIN':
        return 'bg-danger';
      case 'PROFESSOR':
        return 'bg-success';
      case 'STUDENT':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  // Méthode pour obtenir l'icône du rôle
  getRoleIcon(role: string): string {
    switch(role) {
      case 'ADMIN':
        return 'bi bi-person-badge';
      case 'PROFESSOR':
        return 'bi bi-person-workspace';
      case 'STUDENT':
        return 'bi bi-mortarboard';
      default:
        return 'bi bi-person';
    }
  }

  // Méthode pour obtenir le libellé du type de recherche
  getSearchTypeLabel(type: string): string {
    switch(type) {
      case 'username':
        return 'Nom d\'utilisateur';
      case 'cin':
        return 'CIN';
      case 'email':
        return 'Email';
      case 'name':
        return 'Nom/Prénom';
      case 'all':
      default:
        return 'Tous les champs';
    }
  }
}