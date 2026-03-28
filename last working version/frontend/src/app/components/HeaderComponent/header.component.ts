import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  username = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // First check current state
    this.updateAuthState();
    
    // Set up an interval to check auth state every second
    // This ensures the header updates when auth state changes
    setInterval(() => {
      this.updateAuthState();
    }, 1000);
  }

  private updateAuthState() {
    const wasAuthenticated = this.isAuthenticated;
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (this.isAuthenticated) {
      this.username = this.authService.getUsername();
      
      // Debug: afficher les groupes et rôles
      console.log('User groups:', this.authService.getGroups());
      console.log('User roles:', this.authService.getRoles());
      console.log('Is admin:', this.authService.isAdmin());
      console.log('Is professor:', this.authService.isProfessor());
    }
    
    if (wasAuthenticated !== this.isAuthenticated) {
      console.log('Auth state changed:', this.isAuthenticated ? 'Logged in' : 'Logged out');
    }
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

  register() {
    this.authService.register();
  }
}