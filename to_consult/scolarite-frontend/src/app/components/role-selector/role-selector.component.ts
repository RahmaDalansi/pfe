import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakAuthService } from '../../services/keycloak.service';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-selector.component.html',
  styleUrls: ['./role-selector.component.css']
})
export class RoleSelectorComponent implements OnInit {
  username = '';
  availableRoles: { role: string; name: string; icon: string; description: string }[] = [];
  hasMultipleRoles = false;

  constructor(
    private keycloakService: KeycloakAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = this.keycloakService.getUsername();
    const roles = this.keycloakService.getUserRoles();
    
    // Déterminer les rôles disponibles
    if (roles.includes('ADMIN')) {
      this.availableRoles.push({
        role: 'ADMIN',
        name: 'Administrateur',
        icon: 'bi-shield-lock',
        description: 'Gestion des utilisateurs, matières, et paramètres système'
      });
    }
    if (roles.includes('PROFESSOR')) {
      this.availableRoles.push({
        role: 'PROFESSOR',
        name: 'Professeur',
        icon: 'bi-person-workspace',
        description: 'Gestion de vos préférences d\'enseignement et profil'
      });
    }
    if (roles.includes('STUDENT')) {
      this.availableRoles.push({
        role: 'STUDENT',
        name: 'Étudiant',
        icon: 'bi-mortarboard',
        description: 'Consultez vos cours et votre emploi du temps'
      });
    }
    
    this.hasMultipleRoles = this.availableRoles.length > 1;
    
    // Si un seul rôle, rediriger directement
    if (this.availableRoles.length === 1) {
      this.selectRole(this.availableRoles[0].role);
    }
  }

  selectRole(role: string) {
    // Sauvegarder le rôle choisi dans le localStorage pour ne pas redemander à chaque fois
    localStorage.setItem('selectedRole', role);
    
    switch(role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'PROFESSOR':
        this.router.navigate(['/dashboard']);
        break;
      case 'STUDENT':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}