import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is authenticated
    if (this.authService.isAuthenticated()) {
      console.log('AuthGuard: Access granted to', state.url);
      return true;
    }

    // Not authenticated, redirect to home page with return URL
    console.log('AuthGuard: Access denied to', state.url, '- redirecting to home');
    this.router.navigate(['/'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}