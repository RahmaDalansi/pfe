import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterLinkActive, NavigationStart } from '@angular/router';
import { KeycloakAuthService } from './services/keycloak.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  userRole = '';

  constructor(
    private keycloakService: KeycloakAuthService,
    private router: Router
  ) {
    // Écouter les changements de route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('🔄 Navigation vers:', event.url);
        console.log('👤 Rôle utilisateur:', this.userRole);
        console.log('🔑 Rôles Keycloak:', this.keycloakService.getUserRoles());
      }
    });
  }

  ngOnInit() {
    this.updateUserInfo();
    // Mettre à jour toutes les 5 secondes au lieu de 2
    setInterval(() => this.updateUserInfo(), 5000);
  }

  updateUserInfo() {
    this.isLoggedIn = this.keycloakService.isLoggedIn();
    if (this.isLoggedIn) {
      this.username = this.keycloakService.getUsername();
      const roles = this.keycloakService.getUserRoles();
      console.log('📊 Mise à jour des rôles:', roles);
      this.userRole = roles.includes('PROFESSOR') ? 'PROFESSOR' :
                      roles.includes('ADMIN') ? 'ADMIN' :
                      roles.includes('STUDENT') ? 'STUDENT' : 'USER';
    }
  }

  logout(event: Event) {
    event.preventDefault();
    this.keycloakService.logout();
  }
}