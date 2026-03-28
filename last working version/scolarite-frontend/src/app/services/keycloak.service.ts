import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class KeycloakAuthService {
  
  constructor(
    private keycloak: KeycloakService,
    private router: Router  // Inject Router directement
  ) {}

  async initKeycloak() {
    try {
      await this.keycloak.init({
        config: {
          url: 'http://localhost:8081',
          realm: 'scolarite',
          clientId: 'springboot-app'
        },
        initOptions: {
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
          redirectUri: window.location.origin,
          checkLoginIframe: false
        },
        enableBearerInterceptor: true,
        bearerExcludedUrls: ['/assets', '/public']
      });
      console.log('Keycloak initialized successfully with realm: scolarite');
    } catch (error) {
      console.error('Keycloak init failed', error);
    }
  }

  async getToken(): Promise<string> {
    try {
      return await this.keycloak.getToken();
    } catch (error) {
      console.error('Failed to get token', error);
      return '';
    }
  }

  logout(): void {
    this.keycloak.logout(window.location.origin);
  }

  getUserId(): string {
    const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
    return tokenParsed?.['sub'] || '';
  }

  getUsername(): string {
    const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
    return tokenParsed?.['preferred_username'] || tokenParsed?.['email'] || 'User';
  }

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  getUserRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  hasRequiredAction(): boolean {
    const token = this.keycloak.getKeycloakInstance();
    if (token?.tokenParsed) {
      const requiredActions = token.tokenParsed['required_actions'] || [];
      return requiredActions.includes('UPDATE_PASSWORD');
    }
    return false;
  }

  getUserRole(): string {
    const roles = this.getUserRoles();
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('PROFESSOR')) return 'PROFESSOR';
    if (roles.includes('STUDENT')) return 'STUDENT';
    return 'USER';
  } 
  
  getEmail(): string {
      const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
      return tokenParsed?.['email'] || '';
    }
  // CORRECTION: Retire la méthode avec inject()
  isPending(): boolean {
    return this.getUserRoles().includes('PENDING');
  }

  // CORRECTION: Passe Router en paramètre
  async redirectBasedOnRole(): Promise<void> {
    const roles = this.getUserRoles();
    
    if (roles.includes('ADMIN')) {
      await this.router.navigate(['/admin/validation']);
    } else if (roles.includes('PENDING')) {
      await this.router.navigate(['/pending']);
    } else if (roles.includes('STUDENT') || roles.includes('PROFESSOR')) {
      await this.router.navigate(['/dashboard']);
    } else {
      await this.router.navigate(['/']);
    }
  }

    async debugToken(): Promise<void> {
    try {
        const token = await this.getToken();
        console.log('🔑 Token récupéré:', token ? 'Oui' : 'Non');
        
        if (token) {
        // Décoder le token (sans vérifier la signature)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        console.log('📝 Payload du token:', {
            username: payload.preferred_username,
            email: payload.email,
            roles: payload.realm_access?.roles,
            issuer: payload.iss,
            expiration: new Date(payload.exp * 1000).toLocaleString(),
            subject: payload.sub
        });
        
        // Vérifier si le token est expiré
        const now = Date.now() / 1000;
        if (payload.exp < now) {
            console.error('❌ Token EXPIRÉ !');
        } else {
            console.log('✅ Token valide jusqu\'à:', new Date(payload.exp * 1000).toLocaleString());
        }
        }
    } catch (error) {
        console.error('❌ Erreur décodage token:', error);
    }
    }

}