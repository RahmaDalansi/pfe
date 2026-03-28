import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakAuthService } from '../../services/keycloak.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-keycloak-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <h2>Keycloak Debug Information</h2>
      
      <div class="card mt-3">
        <div class="card-header bg-primary text-white">
          Connection Status
        </div>
        <div class="card-body">
          <p><strong>Keycloak URL:</strong> http://localhost:8081</p>
          <p><strong>Realm:</strong> scolarite</p>
          <p><strong>Client ID:</strong> springboot-app</p>
          <p><strong>Is Logged In:</strong> 
            <span [class.text-success]="isLoggedIn" [class.text-danger]="!isLoggedIn">
              {{ isLoggedIn ? 'Yes' : 'No' }}
            </span>
          </p>
          @if (isLoggedIn) {
            <p><strong>Username:</strong> {{ username }}</p>
            <p><strong>User Role:</strong> {{ userRole }}</p>
            <p><strong>Token Present:</strong> Yes</p>
            <p><strong>Has UPDATE_PASSWORD Action:</strong> 
              <span [class.text-warning]="hasPasswordAction">
                {{ hasPasswordAction ? 'Yes' : 'No' }}
              </span>
            </p>
            <div class="mt-3">
              <h5>User Roles:</h5>
              <ul>
                @for (role of userRoles; track role) {
                  <li>{{ role }}</li>
                }
              </ul>
            </div>
          }
        </div>
        <div class="card-footer">
          @if (!isLoggedIn) {
            <button class="btn btn-primary" (click)="login()">Login</button>
          } @else {
            <button class="btn btn-danger" (click)="logout()">Logout</button>
          }
          <button class="btn btn-secondary ms-2" (click)="refresh()">Refresh</button>
        </div>
      </div>

      @if (error) {
        <div class="alert alert-danger mt-3">
          {{ error }}
        </div>
      }
    </div>
  `
})
export class KeycloakDebugComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  userRole = '';
  userRoles: string[] = [];
  hasPasswordAction = false;
  error = '';

  constructor(
    private keycloakAuthService: KeycloakAuthService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    try {
      this.isLoggedIn = this.keycloakAuthService.isLoggedIn();
      if (this.isLoggedIn) {
        this.username = this.keycloakAuthService.getUsername();
        this.userRole = this.keycloakAuthService.getUserRole();
        this.userRoles = this.keycloakAuthService.getUserRoles();
        this.hasPasswordAction = this.keycloakAuthService.hasRequiredAction();
      }
    } catch (e: any) {
      this.error = e.message;
    }
  }

  async login() {
    try {
      await this.keycloakService.login({
        redirectUri: window.location.origin + '/debug'
      });
    } catch (e: any) {
      this.error = e.message;
    }
  }

  logout() {
    this.keycloakAuthService.logout();
  }

  refresh() {
    this.checkStatus();
  }
}