import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakAuthService } from '../../../services/keycloak.service';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.css']
})
export class PendingComponent implements OnInit {
  username = '';

  constructor(
    private keycloakService: KeycloakAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = this.keycloakService.getUsername();
  }

  checkStatus() {
    const roles = this.keycloakService.getUserRoles();
    if (!roles.includes('PENDING')) {
      this.router.navigate(['/dashboard']);
    }
  }

  logout() {
    this.keycloakService.logout();
  }
}