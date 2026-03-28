import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak: Keycloak;
  private authenticated = false;
  private userProfile: any = null;
  private initPromise: Promise<boolean> | null = null;

  // Creates a Keycloak client instance with your configuration
  constructor(private router: Router) {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8081',
      realm: 'scolarite',
      clientId: 'springboot-app'
    });
  }

  async init(): Promise<boolean> {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise(async (resolve) => {
      try {
        console.log('Initializing Keycloak...');
        
        this.authenticated = await this.keycloak.init({
          onLoad: 'check-sso', 
          silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
          // Add this line to handle the login_required error
          silentCheckSsoFallback: false, // Don't fallback to login page
          pkceMethod: 'S256',
          checkLoginIframe: false
        });

        if (this.authenticated) {
          this.userProfile = await this.keycloak.loadUserProfile();
          console.log('User authenticated:', this.userProfile);
          
          // Log debug info after authentication
          console.log('Token parsed:', this.keycloak.tokenParsed);
          console.log('Groups:', this.getGroups());
          console.log('Roles:', this.getRoles());
        } else {
          console.log('User not authenticated');
        }

        resolve(this.authenticated);
      } catch (error) {
        console.error('Keycloak init failed:', error);
        this.authenticated = false;
        resolve(false);
      }
    });

    return this.initPromise;
  }

  login(): void {
    console.log('Redirecting to Keycloak login...');
    this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  logout(): void {
    console.log('Logging out...');
    this.authenticated = false;
    this.userProfile = null;
    this.keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  register(): void {
    console.log('Redirecting to Keycloak registration...');
    
    // Use the built-in Keycloak method if available
    if (this.keycloak && typeof this.keycloak.register === 'function') {
      this.keycloak.register({
        redirectUri: window.location.origin
      });
    } else {
      // Fallback manual URL
      const redirectUri = encodeURIComponent(window.location.origin);
      const registerUrl = `http://localhost:8081/realms/scolarite/protocol/openid-connect/registrations?client_id=springboot-app&response_type=code&scope=openid%20email%20profile&redirect_uri=${redirectUri}&code_challenge_method=S256`;
      
      window.location.href = registerUrl;
    }
  }

  isAuthenticated(): boolean {
    // Double-check with Keycloak if we think we're authenticated
    if (this.authenticated && this.keycloak) {
      // Verify the token is still valid
      if (this.keycloak.isTokenExpired && this.keycloak.isTokenExpired()) {
        console.log('Token expired, updating authentication state');
        this.authenticated = false;
        this.userProfile = null;
      }
    }
    return this.authenticated;
  }

  getUsername(): string {
    if (!this.authenticated) return '';
    
    // Try to get username from multiple possible locations
    const tokenParsed = this.keycloak.tokenParsed as any;
    return tokenParsed?.name || 
           tokenParsed?.given_name || 
           this.userProfile?.username || 
           this.userProfile?.firstName || 
           'User';
  }

  getEmail(): string {
    if (!this.authenticated) return '';
    
    const tokenParsed = this.keycloak.tokenParsed as any;
    return tokenParsed?.email || this.userProfile?.email || '';
  }

  getRoles(): string[] {
    if (!this.authenticated) return [];
    
    const tokenParsed = this.keycloak.tokenParsed as any;
    const roles = tokenParsed?.realm_access?.roles || [];
    
    // Log pour debug
    console.log('Token parsed:', tokenParsed);
    console.log('Groups:', this.getGroups());
    console.log('Roles:', roles);
    
    return roles;
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  getGroups(): string[] {
    if (!this.authenticated) return [];
    
    const tokenParsed = this.keycloak.tokenParsed as any;
    
    // Keycloak peut mettre les groupes dans différentes claims
    const groups = tokenParsed?.groups || 
                   tokenParsed?.['group_membership'] || 
                   [];
    
    // Nettoyer les chemins (enlever le /)
    return groups.map((group: string) => 
      group.startsWith('/') ? group.substring(1) : group
    );
  }

  isAdmin(): boolean {
    const groups = this.getGroups();
    return groups.includes('ADMINS') || 
           this.getRoles().includes('ADMIN');
  }

  isProfessor(): boolean {
    const groups = this.getGroups();
    return groups.includes('PROFESSORS') || 
           this.getRoles().includes('PROFESSOR');
  }
}