import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login-redirect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-redirect.component.html',
  styleUrls: ['./login-redirect.component.css']
})
export class LoginRedirectComponent implements OnInit {
  
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      await this.keycloakService.login({
        redirectUri: window.location.origin
      });
      
      setTimeout(() => {
        const roles = this.keycloakService.getUserRoles();
        
        if (roles.includes('ADMIN')) {
          this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('PENDING')) {
          this.router.navigate(['/pending']);
        } else if (roles.includes('STUDENT') || roles.includes('PROFESSOR')) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Login failed', error);
      this.router.navigate(['/']);
    }
  }
}