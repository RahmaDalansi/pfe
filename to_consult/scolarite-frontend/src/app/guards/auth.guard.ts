import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const loggedIn = await this.keycloakService.isLoggedIn();
    
    if (!loggedIn) {
      await this.keycloakService.login({
        redirectUri: window.location.origin + state.url
      });
      return false;
    }

    // Vérifier si l'utilisateur est en attente
    const userRoles = this.keycloakService.getUserRoles();
    const isPending = userRoles.includes('PENDING');
    
    // Si l'utilisateur est en attente et essaie d'accéder à une route protégée (sauf /pending)
    if (isPending && state.url !== '/pending') {
      this.router.navigate(['/pending']);
      return false;
    }

    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles) {
      console.log('User roles:', userRoles);
      
      const hasRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        console.log('User missing required role:', requiredRoles);
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}