import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
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

  constructor(private keycloakService: KeycloakAuthService) {}

  ngOnInit() {
    this.updateUserInfo();
    setInterval(() => this.updateUserInfo(), 2000);
  }

  updateUserInfo() {
    this.isLoggedIn = this.keycloakService.isLoggedIn();
    if (this.isLoggedIn) {
      this.username = this.keycloakService.getUsername();
      this.userRole = this.keycloakService.getUserRole();
    }
  }

  logout(event: Event) {
    event.preventDefault();
    this.keycloakService.logout();
  }
}